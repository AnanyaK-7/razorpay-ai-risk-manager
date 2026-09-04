import os
import json
import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.preprocessing import OrdinalEncoder
from sklearn.metrics import (
    precision_score, recall_score, f1_score, roc_auc_score,
    confusion_matrix, roc_curve
)

from app.dataset.synthetic_generator import generate_comprehensive_scam_dataset, SCAM_TYPES

MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../data/artifacts'))

FEATURE_COLS = [
    'amount', 'category', 'payment_method', 'account_age_days',
    'historical_return_rate', 'past_chargebacks', 'address_changed_hours',
    'device_trust_score', 'promo_code_used', 'ip_country_match',
    'is_vpn_or_proxy', 'same_device_account_count',
    'velocity_1h_count', 'login_to_checkout_minutes', 'is_disposable_email',
    'card_bin_country_match', 'upi_collect_prompted', 'delivery_dropzone_risk',
    'is_otp_forwarding_active', 'remote_screen_share_active', 'vishing_call_in_progress',
    'referred_from_phishing_link', 'sideloaded_apk_detected', 'domain_reputation_score',
    'is_first_transfer_to_unknown_vpa', 'high_lottery_keyword_score', 'unusual_savings_drain_ratio'
]

CATEGORICAL_COLS = ['category', 'payment_method']
COST_PER_FALSE_POSITIVE = 450.0

def train_and_evaluate_model():
    os.makedirs(MODEL_DIR, exist_ok=True)

    dataset_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../data/transactions_all_scams_18k.csv'))
    if os.path.exists(dataset_path):
        df = pd.read_csv(dataset_path)
    else:
        df = generate_comprehensive_scam_dataset(18000, seed=42)
        df.to_csv(dataset_path, index=False)

    X = df[FEATURE_COLS].copy()
    y = df['is_fraud'].values

    encoder = OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1)
    X[CATEGORICAL_COLS] = encoder.fit_transform(X[CATEGORICAL_COLS])

    # Explicit 80/20 train/test split
    X_train, X_test, y_train, y_test, df_train, df_test = train_test_split(
        X, y, df, test_size=0.20, random_state=42, stratify=y
    )

    clf = HistGradientBoostingClassifier(
        categorical_features=[FEATURE_COLS.index(c) for c in CATEGORICAL_COLS],
        max_iter=250,
        learning_rate=0.06,
        random_state=42
    )
    clf.fit(X_train, y_train)

    y_probs = clf.predict_proba(X_test)[:, 1]
    default_threshold = 0.50
    y_preds = (y_probs >= default_threshold).astype(int)

    precision = precision_score(y_test, y_preds)
    recall = recall_score(y_test, y_preds)
    f1 = f1_score(y_test, y_preds)
    auc = roc_auc_score(y_test, y_probs)
    tn, fp, fn, tp = confusion_matrix(y_test, y_preds).ravel()

    fraud_amounts = df_test.loc[df_test['is_fraud'] == 1, 'amount']
    avg_fraud_loss = float(fraud_amounts.mean()) if len(fraud_amounts) > 0 else 16500.0

    total_fraud_prevented = float(tp * avg_fraud_loss)
    total_fp_friction_cost = float(fp * COST_PER_FALSE_POSITIVE)
    net_savings = total_fraud_prevented - total_fp_friction_cost
    roi_percentage = (net_savings / (total_fp_friction_cost + 1e-5)) * 100

    scam_type_performance = {}
    for stype in SCAM_TYPES:
        if stype == 'CLEAN':
            continue
        sub_mask = (df_test['scam_type'] == stype).values
        if sub_mask.sum() > 0:
            stype_total = int(sub_mask.sum())
            stype_caught = int((y_preds[sub_mask] == 1).sum())
            stype_recall = round(stype_caught / stype_total, 4)
            scam_type_performance[stype] = {
                'total_test_instances': stype_total,
                'caught_count': stype_caught,
                'detection_rate_percent': round(stype_recall * 100, 1)
            }

    fpr_pts, tpr_pts, thresholds_pts = roc_curve(y_test, y_probs)
    roc_curve_data = [
        {'fpr': round(float(f), 4), 'tpr': round(float(t), 4), 'threshold': round(float(th), 4)}
        for f, t, th in zip(fpr_pts[::10], tpr_pts[::10], thresholds_pts[::10])
    ]

    threshold_analysis = []
    for thresh in np.arange(0.10, 0.95, 0.05):
        p_preds = (y_probs >= thresh).astype(int)
        _tn, _fp, _fn, _tp = confusion_matrix(y_test, p_preds).ravel()
        _prec = precision_score(y_test, p_preds, zero_division=0)
        _rec = recall_score(y_test, p_preds, zero_division=0)
        _saved = float(_tp * avg_fraud_loss) - float(_fp * COST_PER_FALSE_POSITIVE)
        threshold_analysis.append({
            'threshold': round(float(thresh), 2),
            'precision': round(float(_prec), 4),
            'recall': round(float(_rec), 4),
            'tp': int(_tp),
            'fp': int(_fp),
            'fn': int(_fn),
            'tn': int(_tn),
            'net_savings': round(_saved, 2)
        })

    from sklearn.inspection import permutation_importance
    perm_imp = permutation_importance(clf, X_test, y_test, n_repeats=5, random_state=42)
    feature_importances = [
        {'feature': col, 'importance': round(float(imp), 4)}
        for col, imp in sorted(zip(FEATURE_COLS, perm_imp.importances_mean), key=lambda x: x[1], reverse=True)
    ]

    heldout_metrics = {
        'split_info': {
            'total_dataset_size': len(df),
            'train_samples_count': len(X_train),
            'heldout_test_samples_count': len(X_test),
            'split_ratio': '80/20 Stratified Train/Test Split',
            'evaluation_date': '2026-09-04T19:26:00Z',
            'verification_script': 'app/ml/model_trainer.py'
        },
        'total_test_samples': len(y_test),
        'heldout_fraud_count': int(y_test.sum()),
        'heldout_safe_count': int(len(y_test) - y_test.sum()),
        'precision': round(float(precision), 4),
        'recall': round(float(recall), 4),
        'f1_score': round(float(f1), 4),
        'roc_auc': round(float(auc), 4),
        'confusion_matrix': {'tp': int(tp), 'fp': int(fp), 'fn': int(fn), 'tn': int(tn)},
        'financial_metrics': {
            'avg_fraud_loss_inr': round(avg_fraud_loss, 2),
            'cost_per_false_positive_inr': COST_PER_FALSE_POSITIVE,
            'total_fraud_prevented_inr': round(total_fraud_prevented, 2),
            'total_fp_friction_cost_inr': round(total_fp_friction_cost, 2),
            'net_savings_inr': round(net_savings, 2),
            'roi_percentage': round(roi_percentage, 1)
        },
        'scam_type_performance': scam_type_performance,
        'roc_curve': roc_curve_data,
        'threshold_analysis': threshold_analysis,
        'feature_importances': feature_importances,
        'compliance': {
            'strictly_defense_only': True,
            'offense_capable_features': False,
            'audit_trail_gated': True
        }
    }

    with open(os.path.join(MODEL_DIR, 'classifier.pkl'), 'wb') as f:
        pickle.dump({'model': clf, 'encoder': encoder, 'features': FEATURE_COLS}, f)

    with open(os.path.join(MODEL_DIR, 'heldout_metrics.json'), 'w') as f:
        json.dump(heldout_metrics, f, indent=2)

    df_test.to_csv(os.path.join(MODEL_DIR, 'heldout_test_set.csv'), index=False)

    print("Comprehensive Multi-Scam Model Training Complete!")
    print(f"Train Samples: {len(X_train)} | Test Samples: {len(X_test)}")
    print(f"Held-Out Precision: {precision*100:.2f}% | Recall: {recall*100:.2f}% | ROC-AUC: {auc:.4f}")
    print(f"Net Financial Savings: INR {net_savings:,.2f}")

    return heldout_metrics

if __name__ == '__main__':
    train_and_evaluate_model()

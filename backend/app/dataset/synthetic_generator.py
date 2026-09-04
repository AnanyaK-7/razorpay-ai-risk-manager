import os
import random
import numpy as np
import pandas as pd

SCAM_TYPES = [
    'CLEAN',
    'RETURN_FRAUD',
    'CHARGEBACK_FRAUD',
    'ABUSE_RING_SYBIL',
    'UPI_COLLECT_SPOOF',
    'ACCOUNT_TAKEOVER',
    'CARDING_VELOCITY',
    'SYNTHETIC_IDENTITY',
    'OTP_VISHING_FRAUD',
    'PHISHING_LINK_MALWARE',
    'LOTTERY_REWARD_SCAM'
]

def generate_comprehensive_scam_dataset(num_samples: int = 18000, seed: int = 42) -> pd.DataFrame:
    """
    Generates realistic Indian E-Commerce & BFSI Financial Scam transactions across 10 major scam vectors:
    1. Return Fraud & Wardrobing
    2. Chargeback & Friendly Fraud
    3. Sybil Promo & Voucher Abuse Rings
    4. UPI Collect Request & VPA Spoofing
    5. Account Takeover (ATO) & Session Hijacking
    6. Carding Velocity & BIN Attacks
    7. Synthetic Identity & BNPL Default Fraud
    8. OTP Bank Impersonation & Screen-Share Vishing Fraud
    9. Phishing Link & Malicious APK Malware Scam
    10. Lottery Prize & Task Reward Investment Scam
    """
    np.random.seed(seed)
    random.seed(seed)

    categories = ['ELECTRONICS', 'LUXURY_FASHION', 'DIGITAL_VOUCHER', 'FOOTWEAR', 'JEWELRY', 'GROCERY', 'P2P_TRANSFER', 'INVESTMENT_FEE']
    payment_methods = ['UPI_INTENT', 'UPI_COLLECT', 'CREDIT_CARD', 'DEBIT_CARD', 'NETBANKING', 'COD', 'IMPS_NEFT']
    merchants = ['mch_fashion_hub', 'mch_gadget_bazar', 'mch_quick_vouchers', 'mch_luxe_jewels', 'mch_hyper_grocery', 'p2p_lottery_claim', 'unknown_vpa_merchant']

    ring_devices = [f"dev_fingerprint_ring_{i}" for i in range(1, 25)]
    ring_vpas = [f"scam_bot_{i}@okicici" for i in range(1, 25)]
    ring_addresses = [f"Drop Hub {100+i}, Sector 62, Noida, UP" for i in range(1, 20)]

    data = []

    for i in range(1, num_samples + 1):
        txn_id = f"txn_rzp_{i:06d}"
        merchant_id = random.choice(merchants)
        user_id = f"usr_{random.randint(1000, 99999)}"
        category = random.choice(categories)
        payment_method = random.choice(payment_methods)

        if category in ['ELECTRONICS', 'JEWELRY']:
            amount = round(float(np.random.uniform(8000, 95000)), 2)
        elif category in ['P2P_TRANSFER', 'INVESTMENT_FEE']:
            amount = round(float(np.random.uniform(5000, 150000)), 2)
        elif category == 'LUXURY_FASHION':
            amount = round(float(np.random.uniform(3000, 45000)), 2)
        elif category == 'DIGITAL_VOUCHER':
            amount = round(float(np.random.uniform(500, 15000)), 2)
        else:
            amount = round(float(np.random.uniform(150, 5000)), 2)

        account_age_days = int(np.random.exponential(scale=200))
        historical_return_rate = float(np.clip(np.random.beta(a=1.5, b=8.0), 0.0, 1.0))
        past_chargebacks = int(np.random.choice([0, 1, 2, 3], p=[0.93, 0.04, 0.02, 0.01]))
        address_changed_hours = round(float(np.random.exponential(scale=72)), 1)
        device_trust_score = float(np.clip(np.random.normal(loc=80, scale=16), 5.0, 100.0))
        promo_code_used = int(random.random() < 0.30)
        ip_country_match = int(random.random() < 0.94)
        is_vpn_or_proxy = int(random.random() < 0.07)
        same_device_account_count = random.randint(1, 2)
        velocity_1h_count = random.randint(1, 3)
        login_to_checkout_minutes = round(float(np.random.exponential(scale=45)), 1)
        is_disposable_email = int(random.random() < 0.05)
        card_bin_country_match = int(random.random() < 0.95)
        upi_collect_prompted = int(payment_method == 'UPI_COLLECT')
        delivery_dropzone_risk = round(float(np.random.beta(a=1.0, b=5.0)), 2)

        # Financial Social Engineering Scam Signals
        is_otp_forwarding_active = 0
        remote_screen_share_active = 0
        vishing_call_in_progress = 0
        referred_from_phishing_link = 0
        sideloaded_apk_detected = 0
        domain_reputation_score = round(float(np.random.uniform(75.0, 99.0)), 1)
        is_first_transfer_to_unknown_vpa = 0
        high_lottery_keyword_score = round(float(np.random.uniform(0.0, 15.0)), 1)
        unusual_savings_drain_ratio = round(float(np.random.uniform(0.02, 0.20)), 2)

        device_hash = f"dev_hash_{random.randint(10000, 99999)}"
        vpa = f"user_{random.randint(100, 999)}@okhdfcbank"
        delivery_address = f"House No {random.randint(1, 500)}, Bengaluru"

        scam_type = 'CLEAN'
        scam_rand = random.random()

        if scam_rand < 0.025:
            # 1. Return Fraud
            scam_type = 'RETURN_FRAUD'
            historical_return_rate = round(float(np.random.uniform(0.50, 0.96)), 4)
            payment_method = 'COD'
            category = random.choice(['LUXURY_FASHION', 'ELECTRONICS'])

        elif scam_rand < 0.045:
            # 2. Chargeback Fraud
            scam_type = 'CHARGEBACK_FRAUD'
            past_chargebacks = random.randint(1, 3)
            is_vpn_or_proxy = 1
            ip_country_match = 0
            amount = round(float(np.random.uniform(25000, 85000)), 2)

        elif scam_rand < 0.065:
            # 3. Sybil Abuse Ring
            scam_type = 'ABUSE_RING_SYBIL'
            device_hash = random.choice(ring_devices)
            vpa = random.choice(ring_vpas)
            delivery_address = random.choice(ring_addresses)
            same_device_account_count = random.randint(5, 18)
            promo_code_used = 1

        elif scam_rand < 0.085:
            # 4. UPI Collect Spoof
            scam_type = 'UPI_COLLECT_SPOOF'
            payment_method = 'UPI_COLLECT'
            upi_collect_prompted = 1
            vpa = f"bank_verification_{random.randint(100,999)}@paytm"

        elif scam_rand < 0.105:
            # 5. Account Takeover (ATO)
            scam_type = 'ACCOUNT_TAKEOVER'
            account_age_days = random.randint(400, 1400)
            login_to_checkout_minutes = round(float(np.random.uniform(0.1, 1.5)), 1)
            address_changed_hours = round(float(np.random.uniform(0.1, 1.0)), 1)

        elif scam_rand < 0.125:
            # 6. Carding Velocity
            scam_type = 'CARDING_VELOCITY'
            payment_method = 'CREDIT_CARD'
            velocity_1h_count = random.randint(10, 30)
            card_bin_country_match = 0

        elif scam_rand < 0.145:
            # 7. Synthetic Identity
            scam_type = 'SYNTHETIC_IDENTITY'
            account_age_days = random.randint(1, 4)
            is_disposable_email = 1
            delivery_dropzone_risk = round(float(np.random.uniform(0.80, 0.99)), 2)

        elif scam_rand < 0.165:
            # 8. NEW: OTP Bank & Screen-Share Vishing Fraud
            scam_type = 'OTP_VISHING_FRAUD'
            vishing_call_in_progress = 1
            remote_screen_share_active = 1
            is_otp_forwarding_active = 1
            device_trust_score = round(float(np.random.uniform(10.0, 30.0)), 1)
            amount = round(float(np.random.uniform(15000, 95000)), 2)

        elif scam_rand < 0.185:
            # 9. NEW: Phishing Link & Sideloaded APK Malware Scam
            scam_type = 'PHISHING_LINK_MALWARE'
            referred_from_phishing_link = 1
            sideloaded_apk_detected = 1
            domain_reputation_score = round(float(np.random.uniform(5.0, 25.0)), 1)
            payment_method = random.choice(['NETBANKING', 'UPI_INTENT'])

        elif scam_rand < 0.205:
            # 10. NEW: Lottery Prize & Task Reward Investment Scam
            scam_type = 'LOTTERY_REWARD_SCAM'
            category = 'INVESTMENT_FEE'
            is_first_transfer_to_unknown_vpa = 1
            high_lottery_keyword_score = round(float(np.random.uniform(75.0, 99.0)), 1)
            unusual_savings_drain_ratio = round(float(np.random.uniform(0.70, 0.98)), 2)
            amount = round(float(np.random.uniform(25000, 150000)), 2)
            merchant_id = 'p2p_lottery_claim'

        is_fraud = 0 if scam_type == 'CLEAN' else 1

        data.append({
            'transaction_id': txn_id,
            'merchant_id': merchant_id,
            'user_id': user_id,
            'amount': amount,
            'category': category,
            'payment_method': payment_method,
            'account_age_days': account_age_days,
            'historical_return_rate': historical_return_rate,
            'past_chargebacks': past_chargebacks,
            'address_changed_hours': address_changed_hours,
            'device_trust_score': device_trust_score,
            'promo_code_used': promo_code_used,
            'ip_country_match': ip_country_match,
            'is_vpn_or_proxy': is_vpn_or_proxy,
            'same_device_account_count': same_device_account_count,
            'velocity_1h_count': velocity_1h_count,
            'login_to_checkout_minutes': login_to_checkout_minutes,
            'is_disposable_email': is_disposable_email,
            'card_bin_country_match': card_bin_country_match,
            'upi_collect_prompted': upi_collect_prompted,
            'delivery_dropzone_risk': delivery_dropzone_risk,
            'is_otp_forwarding_active': is_otp_forwarding_active,
            'remote_screen_share_active': remote_screen_share_active,
            'vishing_call_in_progress': vishing_call_in_progress,
            'referred_from_phishing_link': referred_from_phishing_link,
            'sideloaded_apk_detected': sideloaded_apk_detected,
            'domain_reputation_score': domain_reputation_score,
            'is_first_transfer_to_unknown_vpa': is_first_transfer_to_unknown_vpa,
            'high_lottery_keyword_score': high_lottery_keyword_score,
            'unusual_savings_drain_ratio': unusual_savings_drain_ratio,
            'device_hash': device_hash,
            'vpa': vpa,
            'delivery_address': delivery_address,
            'scam_type': scam_type,
            'is_fraud': is_fraud
        })

    df = pd.DataFrame(data)
    return df

if __name__ == '__main__':
    df = generate_comprehensive_scam_dataset(18000)
    out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../data'))
    os.makedirs(out_dir, exist_ok=True)
    file_path = os.path.join(out_dir, 'transactions_all_scams_18k.csv')
    df.to_csv(file_path, index=False)
    print(f"Generated 18,000 multi-scam transaction records at {file_path}")
    print("All 10 Scam Types Distribution:")
    print(df['scam_type'].value_counts())

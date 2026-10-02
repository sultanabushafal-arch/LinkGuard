from urllib.parse import urlparse
import re


def analyze_url(url):

    reasons = []
    score = 0

    # إضافة HTTPS تلقائيًا إذا لم يكتبه المستخدم
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    parsed = urlparse(url)
    hostname = parsed.hostname or ""
    full_url = url.lower()

    # 1. HTTPS
    if parsed.scheme != "https":
        score += 20
        reasons.append("الرابط لا يستخدم HTTPS")

    # 2. عنوان IP
    is_ip = re.match(r"^\d{1,3}(\.\d{1,3}){3}$", hostname)

    if is_ip:
        score += 25
        reasons.append("الرابط يستخدم عنوان IP بدل اسم نطاق")

    # 3. الرمز @
    if "@" in url:
        score += 20
        reasons.append("الرابط يحتوي على الرمز @")

    # 4. طول الرابط
    if len(url) > 100:
        score += 10
        reasons.append("الرابط طويل بشكل غير معتاد")

    # 5. الكلمات المشبوهة
    suspicious_words = [
        "login",
        "verify",
        "update",
        "secure",
        "account",
        "password",
        "signin",
        "confirm",
        "bank",
        "payment",
        "wallet"
    ]

    found_words = [
        word for word in suspicious_words
        if word in full_url
    ]

    if found_words:
        score += min(len(found_words) * 5, 20)
        reasons.append(
            "الرابط يحتوي على كلمات قد ترتبط بتسجيل الدخول أو التحقق أو الحسابات"
        )

    # 6. عدد المستويات الفرعية
    if not is_ip and hostname.count(".") >= 3:
        score += 10
        reasons.append(
            "النطاق يحتوي على عدد كبير من المستويات الفرعية"
        )

    # 7. منفذ غير معتاد
    if parsed.port is not None:
        if parsed.port not in [80, 443]:
            score += 15
            reasons.append(
                "الرابط يستخدم منفذًا غير معتاد"
            )

    # 8. استخدام رموز ترميز URL
    encoded_count = full_url.count("%")

    if encoded_count >= 3:
        score += 10
        reasons.append(
            "الرابط يحتوي على عدد مرتفع من الرموز المشفرة"
        )

    # 9. وجود شرطات كثيرة في اسم النطاق
    if hostname.count("-") >= 3:
        score += 10
        reasons.append(
            "اسم النطاق يحتوي على عدد كبير من الشرطات"
        )

    # 10. وجود نطاق فرعي يحتوي على كلمات حساسة
    suspicious_subdomain_words = [
        "login",
        "secure",
        "verify",
        "account",
        "signin"
    ]

    subdomain_parts = hostname.split(".")

    if len(subdomain_parts) >= 3:
        subdomain = ".".join(subdomain_parts[:-2])

        if any(word in subdomain for word in suspicious_subdomain_words):
            score += 10
            reasons.append(
                "النطاق الفرعي يحتوي على كلمات مرتبطة بتسجيل الدخول أو التحقق"
            )

    # منع تجاوز الدرجة 100
    score = min(score, 100)

    # تحديد مستوى الخطورة
    if score >= 50:
        risk = "مرتفع"
    elif score >= 25:
        risk = "متوسط"
    else:
        risk = "منخفض"

    # إذا لم توجد مؤشرات
    if not reasons:
        reasons.append(
            "لم يتم اكتشاف مؤشرات مشبوهة واضحة."
        )

    return {
        "url": url,
        "score": score,
        "risk": risk,
        "reasons": reasons
    }
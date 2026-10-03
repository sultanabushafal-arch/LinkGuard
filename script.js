function analyzeURL() {
    const input = document.getElementById("urlInput");
    const result = document.getElementById("result");

    const url = input.value.trim();

    if (!url) {
        result.innerHTML = "<p>الرجاء إدخال رابط أولاً.</p>";
        return;
    }

    let testURL = url;

    if (!/^https?:\/\//i.test(testURL)) {
        testURL = "https://" + testURL;
    }

    let parsedURL;

    try {
        parsedURL = new URL(testURL);
    } catch (error) {
        result.innerHTML = "<p>الرابط غير صالح.</p>";
        return;
    }

    let score = 0;
    let reasons = [];

    const hostname = parsedURL.hostname.toLowerCase();
    const fullURL = testURL.toLowerCase();

    // 1. عدم استخدام HTTPS
    if (parsedURL.protocol !== "https:") {
        score += 15;
        reasons.push("الرابط لا يستخدم HTTPS.");
    }

    // 2. استخدام عنوان IP
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
        score += 25;
        reasons.push("الرابط يستخدم عنوان IP بدلاً من اسم نطاق.");
    }

    // 3. كلمات مرتبطة بالتصيد
    const suspiciousWords = [
        "login",
        "verify",
        "verification",
        "account",
        "password",
        "signin",
        "confirm",
        "secure",
        "update",
        "wallet",
        "payment"
    ];

    const foundWords = suspiciousWords.filter(word =>
        fullURL.includes(word)
    );

    if (foundWords.length > 0) {
        score += Math.min(foundWords.length * 5, 25);
        reasons.push(
            "الرابط يحتوي على كلمات قد ترتبط بتسجيل الدخول أو التحقق أو الحسابات."
        );
    }

    // 4. طول الرابط
    if (testURL.length > 100) {
        score += 10;
        reasons.push("الرابط طويل بشكل غير معتاد.");
    }

    // 5. الرمز @
    if (testURL.includes("@")) {
        score += 20;
        reasons.push("الرابط يحتوي على الرمز @، وقد يُستخدم لإخفاء الوجهة الحقيقية.");
    }

    // 6. كثرة النطاقات الفرعية
    const hostnameParts = hostname.split(".");

    if (hostnameParts.length > 3) {
        score += 10;
        reasons.push("النطاق يحتوي على عدد غير معتاد من النطاقات الفرعية.");
    }

    // 7. كثرة الشرطات
    const hyphenCount = (hostname.match(/-/g) || []).length;

    if (hyphenCount >= 3) {
        score += 10;
        reasons.push("اسم النطاق يحتوي على عدد مرتفع من الشرطات.");
    }

    // 8. كثرة الأرقام في اسم النطاق
    const digitCount = (hostname.match(/\d/g) || []).length;

    if (digitCount >= 4) {
        score += 10;
        reasons.push("اسم النطاق يحتوي على عدد مرتفع من الأرقام.");
    }

    // 9. استخدام رموز غير معتادة في الرابط
    if (/[<>{}\\|[\]^`]/.test(testURL)) {
        score += 10;
        reasons.push("الرابط يحتوي على رموز غير معتادة.");
    }

    // 10. وجود أكثر من معلمة في الرابط
    const parameterCount = parsedURL.searchParams.size;

    if (parameterCount >= 5) {
        score += 10;
        reasons.push("الرابط يحتوي على عدد كبير من المعلمات.");
    }

    // الحد الأقصى للدرجة
    score = Math.min(score, 100);

    // تحديد مستوى الخطورة
    let level;

    if (score < 30) {
        level = "منخفض";
    } else if (score < 60) {
        level = "متوسط";
    } else {
        level = "مرتفع";
    }

    // إذا لم توجد مؤشرات
    if (reasons.length === 0) {
        reasons.push("لم يتم اكتشاف مؤشرات مشبوهة واضحة.");
    }

    // عرض النتيجة
    result.innerHTML =
        "<div class='result-card'>" +
        "<h2>نتيجة التحليل</h2>" +
        "<p><strong>الرابط:</strong> " + escapeHTML(url) + "</p>" +
        "<p><strong>درجة الخطورة:</strong> " + score + " / 100</p>" +
        "<p><strong>مستوى الخطورة:</strong> " + level + "</p>" +
        "<h3>أسباب النتيجة:</h3>" +
        "<ul>" +
        reasons.map(reason => "<li>" + escapeHTML(reason) + "</li>").join("") +
        "</ul>" +
        "</div>";

    // حفظ التحليل
    saveAnalysis(url, score, level);

    // تحديث الإحصائيات والسجل
    updateStatistics();
    displayHistory();
}


function saveAnalysis(url, score, level) {
    let history =
        JSON.parse(localStorage.getItem("linkguard_history")) || [];

    history.unshift({
        url: url,
        score: score,
        level: level,
        date: new Date().toLocaleString("ar-SA")
    });

    // الاحتفاظ بآخر 50 تحليل
    if (history.length > 50) {
        history = history.slice(0, 50);
    }

    localStorage.setItem(
        "linkguard_history",
        JSON.stringify(history)
    );
}


function getHistory() {
    return JSON.parse(
        localStorage.getItem("linkguard_history")
    ) || [];
}


function updateStatistics() {
    const history = getHistory();

    const totalCount = document.getElementById("totalCount");
    const lowCount = document.getElementById("lowCount");
    const mediumCount = document.getElementById("mediumCount");
    const highCount = document.getElementById("highCount");

    if (totalCount) {
        totalCount.textContent = history.length;
    }

    if (lowCount) {
        lowCount.textContent =
            history.filter(item => item.level === "منخفض").length;
    }

    if (mediumCount) {
        mediumCount.textContent =
            history.filter(item => item.level === "متوسط").length;
    }

    if (highCount) {
        highCount.textContent =
            history.filter(item => item.level === "مرتفع").length;
    }
}


function displayHistory() {
    const historyContainer =
        document.getElementById("history");

    if (!historyContainer) {
        return;
    }

    const history = getHistory();

    if (history.length === 0) {
        historyContainer.innerHTML =
            "<p>لا توجد تحليلات سابقة.</p>";
        return;
    }

    historyContainer.innerHTML = history.map(item =>
        "<div class='history-card'>" +
        "<p><strong>الرابط:</strong> " +
        escapeHTML(item.url) +
        "</p>" +

        "<p><strong>الدرجة:</strong> " +
        item.score +
        " / 100</p>" +

        "<p><strong>المستوى:</strong> " +
        escapeHTML(item.level) +
        "</p>" +

        "<small>" +
        escapeHTML(item.date) +
        "</small>" +

        "</div>"
    ).join("");
}


function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}


// تشغيل السجل عند فتح الموقع
document.addEventListener("DOMContentLoaded", function () {
    updateStatistics();
    displayHistory();
});

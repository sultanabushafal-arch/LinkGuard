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

    if (parsedURL.protocol !== "https:") {
        score += 15;
        reasons.push("الرابط لا يستخدم HTTPS.");
    }

    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
        score += 25;
        reasons.push("الرابط يستخدم عنوان IP بدلاً من اسم نطاق.");
    }

    const suspiciousWords = [
        "login",
        "verify",
        "verification",
        "account",
        "password",
        "signin",
        "confirm"
    ];

    if (suspiciousWords.some(word => fullURL.includes(word))) {
        score += 20;
        reasons.push("الرابط يحتوي على كلمات قد ترتبط بتسجيل الدخول أو التحقق.");
    }

    if (testURL.length > 100) {
        score += 10;
        reasons.push("الرابط طويل بشكل غير معتاد.");
    }

    if (testURL.includes("@")) {
        score += 20;
        reasons.push("الرابط يحتوي على الرمز @.");
    }

    if (hostname.split(".").length > 3) {
        score += 10;
        reasons.push("النطاق يحتوي على عدد غير معتاد من النطاقات الفرعية.");
    }

    score = Math.min(score, 100);

    let level;

    if (score < 30) {
        level = "منخفض";
    } else if (score < 60) {
        level = "متوسط";
    } else {
        level = "مرتفع";
    }

    if (reasons.length === 0) {
        reasons.push("لم يتم اكتشاف مؤشرات مشبوهة واضحة.");
    }

    result.innerHTML =
        "<h2>نتيجة التحليل</h2>" +
        "<p><strong>الرابط:</strong> " + url + "</p>" +
        "<p><strong>درجة الخطورة:</strong> " + score + " / 100</p>" +
        "<p><strong>مستوى الخطورة:</strong> " + level + "</p>" +
        "<h3>أسباب النتيجة:</h3>" +
        "<ul>" +
        reasons.map(reason => "<li>" + reason + "</li>").join("") +
        "</ul>";

    saveAnalysis(url, score, level);
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

    document.getElementById("totalCount").textContent =
        history.length;

    document.getElementById("lowCount").textContent =
        history.filter(item => item.level === "منخفض").length;

    document.getElementById("mediumCount").textContent =
        history.filter(item => item.level === "متوسط").length;

    document.getElementById("highCount").textContent =
        history.filter(item => item.level === "مرتفع").length;
}

function displayHistory() {
    const historyContainer =
        document.getElementById("history");

    const history = getHistory();

    if (history.length === 0) {
        historyContainer.innerHTML =
            "<p>لا توجد تحليلات سابقة.</p>";
        return;
    }

    historyContainer.innerHTML = history.map(item =>
        "<div class='history-card'>" +
        "<p><strong>الرابط:</strong> " + item.url + "</p>" +
        "<p><strong>الدرجة:</strong> " + item.score + " / 100</p>" +
        "<p><strong>المستوى:</strong> " + item.level + "</p>" +
        "<small>" + item.date + "</small>" +
        "</div>"
    ).join("");
}

document.addEventListener("DOMContentLoaded", function () {
    updateStatistics();
    displayHistory();
});

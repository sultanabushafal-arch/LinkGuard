function analyzeURL() {
const input = document.getElementById("urlInput");
const result = document.getElementById("result");

```
const url = input.value.trim();

if (!url) {
    result.innerHTML = `
        <div class="result-card">
            <h3>تنبيه</h3>
            <p>الرجاء إدخال رابط أولاً.</p>
        </div>
    `;
    return;
}

let score = 0;
let reasons = [];

let testURL = url;

if (!/^https?:\/\//i.test(testURL)) {
    testURL = "https://" + testURL;
}

let parsedURL;

try {
    parsedURL = new URL(testURL);
} catch (error) {
    result.innerHTML = `
        <div class="result-card">
            <h3>رابط غير صالح</h3>
            <p>تأكد من كتابة الرابط بشكل صحيح.</p>
        </div>
    `;
    return;
}

const hostname = parsedURL.hostname.toLowerCase();
const fullURL = testURL.toLowerCase();

// استخدام عنوان IP بدلاً من اسم نطاق
if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    score += 25;
    reasons.push("الرابط يستخدم عنوان IP بدلاً من اسم نطاق.");
}

// HTTPS
if (parsedURL.protocol !== "https:") {
    score += 15;
    reasons.push("الرابط لا يستخدم HTTPS.");
}

// كلمات شائعة في الروابط المشبوهة
const suspiciousWords = [
    "login",
    "verify",
    "verification",
    "account",
    "secure",
    "update",
    "password",
    "signin",
    "confirm"
];

const foundWords = suspiciousWords.filter(word =>
    fullURL.includes(word)
);

if (foundWords.length > 0) {
    score += Math.min(foundWords.length * 5, 20);
    reasons.push(
        "الرابط يحتوي على كلمات قد ترتبط بتسجيل الدخول أو التحقق أو الحسابات."
    );
}

// النطاق الفرعي
const subdomainParts = hostname.split(".");

if (subdomainParts.length > 3) {
    score += 10;
    reasons.push("النطاق يحتوي على عدد غير معتاد من النطاقات الفرعية.");
}

// طول الرابط
if (testURL.length > 100) {
    score += 10;
    reasons.push("الرابط طويل بشكل غير معتاد.");
}

// وجود رمز @
if (testURL.includes("@")) {
    score += 20;
    reasons.push("الرابط يحتوي على الرمز @، وقد يُستخدم لإخفاء الوجهة الحقيقية.");
}

// كثرة الشرطات
const hyphenCount = (hostname.match(/-/g) || []).length;

if (hyphenCount >= 3) {
    score += 10;
    reasons.push("اسم النطاق يحتوي على عدد مرتفع من الشرطات.");
}

// منع تجاوز 100
score = Math.min(score, 100);

let level = "";
let levelClass = "";

if (score < 30) {
    level = "منخفض";
    levelClass = "low";
} else if (score < 60) {
    level = "متوسط";
    levelClass = "medium";
} else {
    level = "مرتفع";
    levelClass = "high";
}

if (reasons.length === 0) {
    reasons.push("لم يتم اكتشاف مؤشرات مشبوهة واضحة.");
}

result.innerHTML = `
    <div class="result-card ${levelClass}">
        <h2>نتيجة التحليل</h2>

        <p>
            <strong>الرابط:</strong>
            <a href="${escapeHTML(testURL)}" target="_blank" rel="noopener noreferrer">
                ${escapeHTML(url)}
            </a>
        </p>

        <p>
            <strong>درجة الخطورة:</strong>
            ${score} / 100
        </p>

        <p>
            <strong>مستوى الخطورة:</strong>
            ${level}
        </p>

        <h3>أسباب النتيجة:</h3>

        <ul>
            ${reasons.map(reason => `<li>${escapeHTML(reason)}</li>`).join("")}
        </ul>
    </div>
`;

saveAnalysis(url, score, level);
updateStatistics();
displayHistory();
```

}

function saveAnalysis(url, score, level) {
let history = JSON.parse(localStorage.getItem("linkguard_history")) || [];

```
history.unshift({
    url: url,
    score: score,
    level: level,
    date: new Date().toLocaleString("ar-SA")
});

if (history.length > 50) {
    history = history.slice(0, 50);
}

localStorage.setItem("linkguard_history", JSON.stringify(history));
```

}

function getHistory() {
return JSON.parse(localStorage.getItem("linkguard_history")) || [];
}

function updateStatistics() {
const history = getHistory();

```
const totalCount = document.getElementById("totalCount");
const lowCount = document.getElementById("lowCount");
const mediumCount = document.getElementById("mediumCount");
const highCount = document.getElementById("highCount");

if (totalCount) {
    totalCount.textContent = history.length;
}

if (lowCount) {
    lowCount.textContent = history.filter(item => item.level === "منخفض").length;
}

if (mediumCount) {
    mediumCount.textContent = history.filter(item => item.level === "متوسط").length;
}

if (highCount) {
    highCount.textContent = history.filter(item => item.level === "مرتفع").length;
}
```

}

function displayHistory() {
const historyContainer = document.getElementById("history");

```
if (!historyContainer) {
    return;
}

const history = getHistory();

if (history.length === 0) {
    historyContainer.innerHTML = `
        <p>لا توجد تحليلات سابقة.</p>
    `;
    return;
}

historyContainer.innerHTML = history.map(item => `
    <div class="history-card">
        <p>
            <strong>الرابط:</strong>
            ${escapeHTML(item.url)}
        </p>

        <p>
            <strong>الدرجة:</strong>
            ${item.score} / 100
        </p>

        <p>
            <strong>المستوى:</strong>
            ${escapeHTML(item.level)}
        </p>

        <small>
            ${escapeHTML(item.date)}
        </small>
    </div>
`).join("");
```

}

function escapeHTML(text) {
const div = document.createElement("div");
div.textContent = text;
return div.innerHTML;
}

// تشغيل سجل التحليلات عند فتح الصفحة
document.addEventListener("DOMContentLoaded", function () {
updateStatistics();
displayHistory();
});

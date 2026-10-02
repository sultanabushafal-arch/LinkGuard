async function analyzeURL() {
    const urlInput = document.getElementById("urlInput");
    const resultDiv = document.getElementById("result");

    const url = urlInput.value.trim();

    if (url === "") {
        resultDiv.innerHTML = "<p>يرجى إدخال رابط أولًا.</p>";
        return;
    }

    resultDiv.innerHTML = "<p>جاري تحليل الرابط...</p>";

    try {
        const response = await fetch(
            "https://linkguard-backend-w8r0.onrender.com/analyze",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    url: url
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error("حدث خطأ في الخادم");
        }

        var riskClass = "low";

        if (data.risk === "مرتفع") {
            riskClass = "high";
        } else if (data.risk === "متوسط") {
            riskClass = "medium";
        }

        var reasonsHTML = "";

        data.reasons.forEach(function(reason) {
            reasonsHTML += "<li>" + reason + "</li>";
        });

        var degree = data.score * 3.6;

        saveToHistory(data);

        resultDiv.innerHTML =
            "<div class=\"result-card " + riskClass + "\">" +
                "<h2>نتيجة التحليل</h2>" +

                "<p>" +
                    "<strong>الرابط:</strong> " +
                    "<span dir=\"ltr\">" +
                        data.url +
                    "</span>" +
                "</p>" +

                "<div class=\"risk-meter\">" +
                    "<div class=\"meter-circle\" style=\"--degree: " +
                        degree +
                        "deg;\">" +

                        "<div class=\"meter-inner\">" +
                            "<span class=\"meter-score\">" +
                                data.score +
                            "</span>" +

                            "<span class=\"meter-total\">" +
                                "/ 100" +
                            "</span>" +
                        "</div>" +

                    "</div>" +
                "</div>" +

                "<div class=\"risk " +
                    riskClass +
                "\">" +
                    "مستوى الخطورة: " +
                    data.risk +
                "</div>" +

                "<h3>أسباب النتيجة:</h3>" +

                "<ul>" +
                    reasonsHTML +
                "</ul>" +

                "<button class=\"new-analysis\" onclick=\"newAnalysis()\">" +
                    "تحليل رابط جديد" +
                "</button>" +

            "</div>";

        displayHistory();
        updateStats();

    } catch (error) {
        console.error("Error:", error);

        resultDiv.innerHTML =
            "<p>تعذر الاتصال بالخادم.</p>" +
            "<p>تأكد من تشغيل Backend.</p>";
    }
}


function saveToHistory(data) {
    var history = JSON.parse(
        localStorage.getItem("linkguard_history")
    ) || [];

    history.unshift({
        url: data.url,
        score: data.score,
        risk: data.risk
    });

    history = history.slice(0, 10);

    localStorage.setItem(
        "linkguard_history",
        JSON.stringify(history)
    );
}


function displayHistory() {
    var historyDiv = document.getElementById("history");

    if (!historyDiv) {
        return;
    }

    var history = JSON.parse(
        localStorage.getItem("linkguard_history")
    ) || [];

    if (history.length === 0) {
        historyDiv.innerHTML =
            "<p>لا توجد تحليلات سابقة.</p>";
        return;
    }

    var historyHTML = "";

    history.forEach(function(item) {
        var riskClass = "low";

        if (item.risk === "مرتفع") {
            riskClass = "high";
        } else if (item.risk === "متوسط") {
            riskClass = "medium";
        }

        historyHTML +=
            "<div class=\"history-item\">" +

                "<div class=\"history-info\">" +
                    "<span class=\"history-label\">" +
                        "الرابط الذي تم تحليله" +
                    "</span>" +

                    "<div class=\"history-url\" dir=\"ltr\">" +
                        item.url +
                    "</div>" +
                "</div>" +

                "<div class=\"history-score-box\">" +
                    "<span class=\"history-score-label\">" +
                        "درجة الخطورة" +
                    "</span>" +

                    "<span class=\"history-score\">" +
                        item.score +
                        " / 100" +
                    "</span>" +
                "</div>" +

                "<div class=\"history-risk " +
                    riskClass +
                "\">" +
                    item.risk +
                "</div>" +

            "</div>";
    });

    historyDiv.innerHTML = historyHTML;
}


function updateStats() {
    var history = JSON.parse(
        localStorage.getItem("linkguard_history")
    ) || [];

    var total = history.length;
    var low = 0;
    var medium = 0;
    var high = 0;

    history.forEach(function(item) {
        if (item.risk === "منخفض") {
            low++;
        } else if (item.risk === "متوسط") {
            medium++;
        } else if (item.risk === "مرتفع") {
            high++;
        }
    });

    document.getElementById("totalCount").textContent = total;
    document.getElementById("lowCount").textContent = low;
    document.getElementById("mediumCount").textContent = medium;
    document.getElementById("highCount").textContent = high;
}


function newAnalysis() {
    const urlInput = document.getElementById("urlInput");
    const resultDiv = document.getElementById("result");

    urlInput.value = "";
    resultDiv.innerHTML = "";
    urlInput.focus();
}


displayHistory();
updateStats();

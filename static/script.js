(() => {
  const form = document.getElementById("riskForm");
  const submitBtn = document.getElementById("submitBtn");
  const errorNote = document.getElementById("errorNote");
  const verdict = document.getElementById("verdict");

  const incomeInput = document.getElementById("person_income");
  const amountInput = document.getElementById("loan_amnt");
  const percentInput = document.getElementById("loan_percent_income");

  const gaugeFill = document.getElementById("gaugeFill");
  const gaugeThreshold = document.getElementById("gaugeThreshold");
  const probNumber = document.getElementById("probNumber");

  const stampBadge = document.getElementById("stampBadge");
  const stampText = document.getElementById("stampText");

  const factProb = document.getElementById("factProb");
  const factThreshold = document.getElementById("factThreshold");
  const factResult = document.getElementById("factResult");

  const apiDot = document.getElementById("apiDot");
  const apiStatusText = document.getElementById("apiStatusText");

  const GAUGE_CIRCUMFERENCE = 540.35;

  // Automatically calculate the loan-to-income ratio.
  function recalcPercent() {
    const income = parseFloat(incomeInput.value);
    const amount = parseFloat(amountInput.value);

    if (income > 0 && amount >= 0) {
      percentInput.value = (amount / income).toFixed(2);
    }
  }

  incomeInput.addEventListener("input", recalcPercent);
  amountInput.addEventListener("input", recalcPercent);

  recalcPercent();

  // Check whether the backend is available.
  fetch("/openapi.json", { method: "GET" })
    .then((res) => {
      if (res.ok) {
        apiDot.classList.add("ok");
        apiStatusText.textContent = "Service ready";
      } else {
        throw new Error("Backend unavailable");
      }
    })
    .catch(() => {
      apiDot.classList.add("down");
      apiStatusText.textContent = "Service unreachable";
    });

  // Update the submit button while predicting.
  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle("loading", isLoading);

    const label = submitBtn.querySelector(".btn-label");

    if (label) {
      label.textContent = isLoading
        ? "Reviewing file…"
        : "Assess risk";
    }
  }

  // Display an error message.
  function showError(message) {
    errorNote.textContent = message;
    errorNote.hidden = false;
  }

  // Clear previous errors.
  function clearError() {
    errorNote.hidden = true;
    errorNote.textContent = "";
  }

  // Animate the displayed probability.
  function animateNumber(el, from, to, duration) {
    const start = performance.now();

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = from + (to - from) * eased;

      el.textContent = value.toFixed(1);

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = to.toFixed(1);
      }
    }

    requestAnimationFrame(tick);
  }

  // Display the prediction returned by the backend.
  function renderVerdict(data) {
    const probabilityPct = data.default_probability * 100;
    const thresholdPct = data.threshold * 100;
    const isHighRisk = data.default_prediction === 1;

    verdict.hidden = false;

    verdict.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });

    // Update the probability gauge.
    const offset =
      GAUGE_CIRCUMFERENCE * (1 - probabilityPct / 100);

    gaugeFill.style.stroke = isHighRisk
      ? "var(--risk-red)"
      : "var(--risk-green)";

    requestAnimationFrame(() => {
      gaugeFill.style.strokeDashoffset = offset;
    });

    // Display the model's decision threshold.
    gaugeThreshold.style.transform =
      `rotate(${thresholdPct * 3.6}deg)`;

    animateNumber(probNumber, 0, probabilityPct, 1000);

    // Update the risk classification badge.
    stampBadge.classList.remove("stamp--in", "risk-high");

    void stampBadge.offsetWidth;

    if (isHighRisk) {
      stampBadge.classList.add("risk-high");
      stampText.textContent = "HIGH RISK";
    } else {
      stampText.textContent = "LOW RISK";
    }

    requestAnimationFrame(() => {
      stampBadge.classList.add("stamp--in");
    });

    // Update prediction details.
    factProb.textContent = `${probabilityPct.toFixed(1)}%`;

    factThreshold.textContent = `${thresholdPct.toFixed(1)}%`;

    factResult.textContent = data.Result;
  }

  // Submit the existing prediction request.
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    clearError();
    setLoading(true);

    const payload = {
      person_age: parseInt(
        document.getElementById("person_age").value,
        10
      ),

      person_income: parseFloat(incomeInput.value),

      person_home_ownership:
        document.getElementById("person_home_ownership").value,

      person_emp_length: parseFloat(
        document.getElementById("person_emp_length").value
      ),

      loan_intent:
        document.getElementById("loan_intent").value,

      loan_grade:
        document.getElementById("loan_grade").value,

      loan_amnt: parseFloat(amountInput.value),

      loan_int_rate: parseFloat(
        document.getElementById("loan_int_rate").value
      ),

      loan_percent_income: parseFloat(percentInput.value),

      cb_person_default_on_file:
        document.getElementById(
          "cb_person_default_on_file"
        ).value,

      cb_person_cred_hist_length: parseInt(
        document.getElementById(
          "cb_person_cred_hist_length"
        ).value,
        10
      ),
    };

    try {
      const res = await fetch("/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);

        const detail =
          body && body.detail
            ? JSON.stringify(body.detail)
            : `HTTP ${res.status}`;

        throw new Error(detail);
      }

      const data = await res.json();

      renderVerdict(data);
    } catch (err) {
      showError(
        `Could not reach the ledger. ${
          err.message || "Check the service is running."
        }`
      );
    } finally {
      setLoading(false);
    }
  });
})();
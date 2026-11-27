/* Demo only. This file never sends, stores, or transmits answers. */
(function () {
  "use strict";

  var STEPS = [
    { id: "step-visit", label: "Visit" },
    { id: "step-patient", label: "About you" },
    { id: "step-insurance", label: "Insurance" },
    { id: "step-clinical", label: "Provider" },
    { id: "step-consent", label: "Signature" },
    { id: "step-review", label: "Review" }
  ];

  var PROVIDER_ROUTE = {
    marsh: "Route it to Dr. Elena Marsh, the family medicine provider this patient selected, so the right person has the intake before the visit.",
    hale: "Route it to Dr. Aaron Hale, the chiropractor this patient selected, so the right person has the intake before the visit.",
    chen: "Route it to Maya Chen, NP, the home-health provider this patient selected, so the right person has the intake before the visit.",
    any: "Route it to the scheduling team, because this patient asked for the first available provider."
  };

  var step = 0;
  var stored = { card: null, photo: null };

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        var value = attrs[key];
        if (value == null || value === false) return;
        if (key === "class") node.className = value;
        else node.setAttribute(key, value);
      });
    }
    if (children != null && children !== false) {
      var list = Array.isArray(children) ? children : [children];
      list.forEach(function (child) {
        if (child == null || child === false) return;
        node.append(child instanceof Node ? child : document.createTextNode(String(child)));
      });
    }
    return node;
  }

  function valueOf(id) {
    var node = document.getElementById(id);
    return node ? node.value.trim() : "";
  }

  function radioValue(name) {
    var node = document.querySelector('input[name="' + name + '"]:checked');
    return node ? node.value : "";
  }

  function radioSummary(name) {
    var node = document.querySelector('input[name="' + name + '"]:checked');
    if (!node) return "";
    if (node.dataset.summary) return node.dataset.summary;
    var label = node.closest("label");
    return label ? label.innerText.replace(/\s+/g, " ").trim() : node.value;
  }

  function checkedLabels(name) {
    return Array.prototype.map.call(
      document.querySelectorAll('input[name="' + name + '"]:checked'),
      function (input) {
        var label = input.closest("label");
        return label ? label.innerText.replace(/\s+/g, " ").trim() : input.value;
      }
    ).join(", ");
  }

  function selectText(id) {
    var node = document.getElementById(id);
    if (!node || !node.value) return "";
    return node.options[node.selectedIndex].text;
  }

  function isHidden(id) {
    var node = document.getElementById(id);
    return !node || Boolean(node.closest("[hidden]"));
  }

  function startOfToday() {
    var now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function isoDate(date) {
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");
    return date.getFullYear() + "-" + month + "-" + day;
  }

  function parseISODate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    var parts = value.split("-").map(Number);
    var date = new Date(parts[0], parts[1] - 1, parts[2]);
    if (date.getFullYear() !== parts[0] || date.getMonth() !== parts[1] - 1 || date.getDate() !== parts[2]) return null;
    return date;
  }

  function ageYears(dob) {
    var today = startOfToday();
    var age = today.getFullYear() - dob.getFullYear();
    var beforeBirthday = today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate());
    if (beforeBirthday) age -= 1;
    return age;
  }

  function formatLong(value) {
    var date = parseISODate(value);
    if (!date) return value || "";
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }

  function isMinor() {
    var dob = parseISODate(valueOf("dob"));
    return Boolean(dob && ageYears(dob) < 18);
  }

  function expectedName() {
    return (valueOf("first-name") + " " + valueOf("last-name")).replace(/\s+/g, " ").trim();
  }

  function signaturesMatch() {
    var typed = valueOf("signature").replace(/\s+/g, " ");
    var expected = expectedName();
    return expected.length > 0 && typed.toLowerCase() === expected.toLowerCase();
  }

  function personNameProblem(value) {
    var cleaned = value.trim().replace(/\s+/g, " ");
    if (cleaned.length < 2) return "short";
    if (!/^[A-Za-z][A-Za-z .'\u2019-]*$/.test(cleaned)) return "chars";
    if ((cleaned.match(/[A-Za-z]/g) || []).length < 2) return "short";
    return "";
  }

  function formatBytes(size) {
    if (size < 1024) return size + " B";
    if (size < 1024 * 1024) return Math.max(1, Math.round(size / 1024)) + " KB";
    return (size / (1024 * 1024)).toFixed(1) + " MB";
  }

  function fileProblem(file) {
    var allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.indexOf(file.type) === -1) {
      return "Use a JPG, PNG, WEBP, or GIF so the preview can open in this browser.";
    }
    if (!file.size) return "That file is empty.";
    if (file.size > 5 * 1024 * 1024) return "That file is larger than 5 MB. Choose a smaller photo.";
    return "";
  }

  function demoReference() {
    var alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var out = "SFC-";
    var i;
    if (window.crypto && crypto.getRandomValues) {
      var bytes = new Uint32Array(4);
      crypto.getRandomValues(bytes);
      for (i = 0; i < bytes.length; i += 1) out += alphabet[bytes[i] % alphabet.length];
      return out;
    }
    for (i = 0; i < 4; i += 1) out += alphabet[Math.floor(Math.random() * alphabet.length)];
    return out;
  }

  function syncGuardian() {
    document.getElementById("guardian-fields").hidden = !isMinor();
  }

  function syncCoverage() {
    document.getElementById("insured-fields").hidden = radioValue("coverage") !== "insured";
  }

  function syncAccident() {
    document.getElementById("accident-fields").hidden = radioValue("accident") !== "yes";
  }

  function syncCare() {
    document.getElementById("care-fields").hidden = radioValue("visit-for") !== "other";
  }

  function syncClinical() {
    var provider = radioValue("provider");
    ["marsh", "hale", "chen", "any"].forEach(function (id) {
      document.getElementById("panel-" + id).hidden = id !== provider;
    });
    var titles = {
      marsh: "Questions for Dr. Elena Marsh",
      hale: "Questions for Dr. Aaron Hale",
      chen: "Questions for Maya Chen, NP",
      any: "Questions for the scheduling team"
    };
    document.getElementById("clinical-title").textContent = titles[provider] || "Questions for your provider";
  }

  function syncPain() {
    document.getElementById("pain-value").textContent = document.getElementById("pain-level").value;
  }

  function syncSignatureHint() {
    var hint = document.getElementById("signature-hint");
    var name = expectedName();
    hint.textContent = valueOf("first-name") && valueOf("last-name")
      ? "Type your name exactly as " + name + "."
      : "Type your first and last name, the same way you entered them.";
  }

  function syncConcerns(target) {
    if (!target.matches || !target.matches('input[name="concerns"]')) return;
    var boxes = Array.prototype.slice.call(document.querySelectorAll('input[name="concerns"]'));
    if (target.value === "none" && target.checked) {
      boxes.forEach(function (box) {
        if (box !== target) box.checked = false;
      });
    } else if (target.checked) {
      var none = boxes.filter(function (box) { return box.value === "none"; })[0];
      if (none) none.checked = false;
    }
  }

  function syncAll() {
    syncGuardian();
    syncCoverage();
    syncAccident();
    syncCare();
    syncClinical();
    syncPain();
    syncSignatureHint();
  }

  function clearFieldError(id) {
    var msg = document.getElementById(id + "-error");
    if (msg) {
      msg.hidden = true;
      msg.textContent = "";
    }
    var field = document.getElementById(id);
    if (field) field.removeAttribute("aria-invalid");
  }

  function clearErrors() {
    var summary = document.getElementById("error-summary");
    summary.hidden = true;
    summary.querySelector("ul").replaceChildren();
    Array.prototype.forEach.call(document.querySelectorAll(".field-error"), function (node) {
      node.hidden = true;
      node.textContent = "";
    });
    Array.prototype.forEach.call(document.querySelectorAll("[aria-invalid='true']"), function (node) {
      node.removeAttribute("aria-invalid");
    });
  }

  function showErrors(errors) {
    clearErrors();
    if (!errors.length) return false;
    var summary = document.getElementById("error-summary");
    var list = summary.querySelector("ul");
    errors.forEach(function (err) {
      var msg = document.getElementById(err.id + "-error");
      if (msg) {
        msg.hidden = false;
        msg.textContent = err.message;
      }
      var field = document.getElementById(err.id);
      if (field) field.setAttribute("aria-invalid", "true");
      var link = el("a", { href: "#" + (err.focus || err.id) }, err.message);
      link.addEventListener("click", function (event) {
        event.preventDefault();
        var target = document.getElementById(err.focus || err.id);
        if (!target) return;
        target.focus();
        target.scrollIntoView({ block: "center" });
      });
      list.append(el("li", null, link));
    });
    summary.hidden = false;
    summary.focus({ preventScroll: true });
    summary.scrollIntoView({ block: "start" });
    return true;
  }

  function requireName(errors, id, emptyMessage) {
    if (isHidden(id)) return;
    var problem = personNameProblem(valueOf(id));
    if (problem === "chars") errors.push({ id: id, message: "Use letters only." });
    else if (problem) errors.push({ id: id, message: emptyMessage });
  }

  function requireText(errors, id, message, min) {
    if (isHidden(id)) return;
    if (valueOf(id).length < (min || 1)) errors.push({ id: id, message: message });
  }

  function requireSelect(errors, id, message) {
    if (isHidden(id)) return;
    if (!document.getElementById(id).value) errors.push({ id: id, message: message });
  }

  function requireRadio(errors, name, id, message, focus) {
    var fieldset = document.getElementById(id);
    if (!fieldset || fieldset.closest("[hidden]")) return;
    if (!radioValue(name)) errors.push({ id: id, message: message, focus: focus });
  }

  function requireCheck(errors, id, message) {
    var node = document.getElementById(id);
    if (!node || node.closest("[hidden]")) return;
    if (!node.checked) errors.push({ id: id, message: message });
  }

  function requireChecks(errors, name, id, message, focus) {
    var fieldset = document.getElementById(id);
    if (!fieldset || fieldset.closest("[hidden]")) return;
    if (!document.querySelector('input[name="' + name + '"]:checked')) {
      errors.push({ id: id, message: message, focus: focus });
    }
  }

  function requirePhone(errors, id, label) {
    if (isHidden(id)) return;
    var digits = valueOf(id).replace(/\D/g, "");
    var ok = digits.length === 10 || (digits.length === 11 && digits.charAt(0) === "1");
    if (!ok) errors.push({ id: id, message: "Enter a 10-digit " + label + "." });
  }

  function requireEmail(errors, id) {
    if (isHidden(id)) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valueOf(id))) {
      errors.push({ id: id, message: "Enter an email address like name@example.com." });
    }
  }

  function requireZip(errors, id) {
    if (isHidden(id)) return;
    if (!/^\d{5}(-\d{4})?$/.test(valueOf(id))) {
      errors.push({ id: id, message: "Enter a 5-digit ZIP code." });
    }
  }

  function requireDate(errors, id, opts) {
    if (isHidden(id)) return;
    var raw = valueOf(id);
    if (!raw) {
      errors.push({ id: id, message: opts.empty });
      return;
    }
    var date = parseISODate(raw);
    if (!date) {
      errors.push({ id: id, message: "Enter a real date." });
      return;
    }
    var today = startOfToday();
    if (opts.notPast && date < today) errors.push({ id: id, message: opts.past || "Choose today or a later date." });
    if (opts.notFuture && date > today) errors.push({ id: id, message: opts.future || "That date is in the future." });
    if (opts.maxAge != null && ageYears(date) > opts.maxAge) errors.push({ id: id, message: opts.tooOld || "Check the year on that date." });
  }

  function validateVisit() {
    var errors = [];
    requireRadio(errors, "patient-type", "patient-type", "Choose new or returning patient.", "patient-new");
    requireRadio(errors, "provider", "provider", "Choose the provider you are seeing.", "provider-marsh");
    requireDate(errors, "visit-date", { empty: "Choose a preferred date.", notPast: true });
    requireRadio(errors, "visit-time", "visit-time", "Choose a time of day.", "time-morning");
    requireText(errors, "visit-reason", "Add a short reason for the visit (at least 10 characters).", 10);
    return errors;
  }

  function validatePatient() {
    var errors = [];
    requireName(errors, "first-name", "Enter a first name.");
    requireName(errors, "last-name", "Enter a last name.");
    requireDate(errors, "dob", {
      empty: "Enter a date of birth.",
      notFuture: true,
      maxAge: 120,
      future: "Date of birth cannot be in the future.",
      tooOld: "Check the year of birth."
    });
    requirePhone(errors, "phone", "phone number");
    requireEmail(errors, "email");
    requireText(errors, "address", "Enter a street address.", 4);
    requireText(errors, "city", "Enter a city.", 2);
    requireSelect(errors, "state", "Choose a state.");
    requireZip(errors, "zip");
    requireName(errors, "emergency-name", "Enter an emergency contact name.");
    requirePhone(errors, "emergency-phone", "emergency phone number");
    requireName(errors, "guardian-name", "Enter a parent or guardian name.");
    requireSelect(errors, "guardian-relation", "Choose the guardian's relationship to the patient.");
    requirePhone(errors, "guardian-phone", "guardian phone number");
    return errors;
  }

  function validateInsurance() {
    var errors = [];
    requireRadio(errors, "coverage", "coverage", "Choose insured or self-pay.", "coverage-insured");
    requireSelect(errors, "carrier", "Choose an insurance plan.");
    requireText(errors, "member-id", "Enter the member ID from the insurance card.", 3);
    requireName(errors, "holder-name", "Enter the policy holder's name.");
    requireSelect(errors, "holder-relation", "Choose the patient's relationship to the policy holder.");
    ["card", "photo"].forEach(function (kind) {
      if (!stored[kind]) return;
      var problem = fileProblem(stored[kind].file);
      if (!problem) return;
      errors.push({ id: kind === "card" ? "insurance-card" : "photo-id", message: problem });
    });
    return errors;
  }

  function validateClinical() {
    var errors = [];
    if (!radioValue("provider")) {
      errors.push({ id: "clinical-title", message: "Go back and choose a provider.", focus: "change-provider" });
    }
    requireText(errors, "meds", "List current medications, or type None.", 2);
    requireText(errors, "allergies", "List allergies, or type None.", 2);
    requireText(errors, "pharmacy", "Enter a preferred pharmacy.", 2);
    requireRadio(errors, "refill", "refill", "Let us know if you need a refill at this visit.", "refill-yes");
    requireSelect(errors, "pain-area", "Choose where it hurts.");
    requireRadio(errors, "accident", "accident", "Tell us whether this started after an accident or injury.", "accident-yes");
    requireSelect(errors, "accident-type", "Choose the kind of accident.");
    requireDate(errors, "accident-date", { empty: "Enter the approximate date of the accident.", notFuture: true });
    requireSelect(errors, "imaging", "Tell us whether you have had imaging.");
    requireRadio(errors, "visit-for", "visit-for", "Tell us who the home visit is for.", "visit-self");
    requireSelect(errors, "mobility", "Choose how the patient gets around at home.");
    requireChecks(errors, "concerns", "concerns", "Choose at least one home concern, or None of these.", "concern-stairs");
    requireRadio(errors, "home-time", "home-time", "Choose the best time for a home visit.", "home-morning");
    requireName(errors, "care-name", "Enter the caregiver's name.");
    requireText(errors, "care-relation", "Enter how you know the patient.", 2);
    requirePhone(errors, "care-phone", "caregiver phone number");
    requireText(errors, "help-with", "Tell us what you want help with.", 10);
    return errors;
  }

  function validateConsent() {
    var errors = [];
    requireCheck(errors, "privacy-ok", "Confirm that you agree to the Notice of Privacy Practices.");
    requireCheck(errors, "financial-ok", "Confirm that you agree to the financial policy.");
    if (!isHidden("signature") && !signaturesMatch()) {
      var expected = expectedName();
      errors.push({
        id: "signature",
        message: expected
          ? "Type your name exactly as " + expected + "."
          : "Enter your first and last name on the About you step, then type that same name here."
      });
    }
    requireCheck(errors, "signature-intent", "Confirm that your typed name is your electronic signature.");
    return errors;
  }

  function validateStep(index) {
    if (index === 0) return validateVisit();
    if (index === 1) return validatePatient();
    if (index === 2) return validateInsurance();
    if (index === 3) return validateClinical();
    if (index === 4) return validateConsent();
    return [];
  }

  function updateChrome() {
    var status = document.getElementById("step-status");
    status.textContent = "Step " + (step + 1) + " of " + STEPS.length + ": " + STEPS[step].label;
    Array.prototype.forEach.call(document.querySelectorAll("#progress li"), function (item, index) {
      item.classList.toggle("is-current", index === step);
      item.classList.toggle("is-complete", index < step);
      var button = item.querySelector("button");
      button.disabled = index > step;
      if (index === step) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
    document.getElementById("back").hidden = step === 0;
    var next = document.getElementById("next");
    if (step === STEPS.length - 1) next.textContent = "Finish intake";
    else if (step === STEPS.length - 2) next.textContent = "Review intake";
    else next.textContent = "Continue";
    document.getElementById("reassure").textContent = step === STEPS.length - 1
      ? "Finishing stays on this page. Nothing is saved or sent."
      : "Your answers stay in this browser tab.";
  }

  function showStep(next, options) {
    options = options || {};
    step = next;
    STEPS.forEach(function (item, index) {
      document.getElementById(item.id).hidden = index !== step;
    });
    clearErrors();
    syncAll();
    updateChrome();
    if (step === 5) renderReview();
    if (options.focus === false) return;
    var heading = document.querySelector("#" + STEPS[step].id + " h2");
    if (!heading) return;
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({ block: "start" });
  }

  function previewFigure(record, alt, empty) {
    if (!record) return el("p", { class: "hint" }, empty);
    return el("div", { class: "review-file" }, [
      el("img", { src: record.url, alt: alt }),
      el("p", { class: "file-meta" }, record.file.name + ", " + formatBytes(record.file.size))
    ]);
  }

  function reviewSection(title, stepIndex, rows, extras) {
    var button = el("button", { type: "button", class: "text-btn", "aria-label": "Edit " + title }, "Edit");
    button.addEventListener("click", function () { showStep(stepIndex); });
    var block = el("section", { class: "review-block" }, [
      el("div", { class: "review-head" }, [el("h3", null, title), button])
    ]);
    var list = el("dl");
    rows.forEach(function (row) {
      if (!row[1]) return;
      list.append(el("dt", null, row[0]), el("dd", null, row[1]));
    });
    block.append(list);
    (extras || []).forEach(function (node) { block.append(node); });
    return block;
  }

  function renderReview() {
    var root = document.getElementById("review-body");
    var provider = radioValue("provider");
    root.replaceChildren();
    root.append(reviewSection("Visit", 0, [
      ["Patient", radioSummary("patient-type")],
      ["Provider", radioSummary("provider")],
      ["Requested date", formatLong(valueOf("visit-date"))],
      ["Time of day", radioSummary("visit-time")],
      ["Reason", valueOf("visit-reason")]
    ]));

    var patientRows = [
      ["Name", expectedName()],
      ["Date of birth", formatLong(valueOf("dob"))],
      ["Phone", valueOf("phone")],
      ["Email", valueOf("email")],
      ["Address", [valueOf("address"), valueOf("city"), selectText("state"), valueOf("zip")].filter(Boolean).join(", ")],
      ["Emergency contact", valueOf("emergency-name") + ", " + valueOf("emergency-phone")]
    ];
    if (isMinor()) {
      patientRows.push(["Parent or guardian", valueOf("guardian-name") + " (" + selectText("guardian-relation") + "), " + valueOf("guardian-phone")]);
    }
    root.append(reviewSection("About you", 1, patientRows));

    var coverageRows = [["Coverage", radioSummary("coverage")]];
    if (radioValue("coverage") === "insured") {
      coverageRows.push(
        ["Plan", selectText("carrier")],
        ["Member ID", valueOf("member-id")],
        ["Group number", valueOf("group-number")],
        ["Policy holder", valueOf("holder-name")],
        ["Relationship", selectText("holder-relation")]
      );
    }
    root.append(reviewSection("Insurance and ID", 2, coverageRows, [
      el("h4", null, "Insurance card"),
      previewFigure(stored.card, "Preview of the insurance card selected in this browser", "No insurance card added."),
      el("h4", null, "Photo ID"),
      previewFigure(stored.photo, "Preview of the photo ID selected in this browser", "No photo ID added.")
    ]));

    var clinicalRows = [];
    if (provider === "marsh") {
      clinicalRows = [
        ["Medications", valueOf("meds")],
        ["Allergies", valueOf("allergies")],
        ["Pharmacy", valueOf("pharmacy")],
        ["Refill requested", radioSummary("refill")]
      ];
    } else if (provider === "hale") {
      clinicalRows = [
        ["Pain location", selectText("pain-area")],
        ["Pain today", document.getElementById("pain-level").value + " out of 10"],
        ["After an accident", radioSummary("accident")]
      ];
      if (radioValue("accident") === "yes") {
        clinicalRows.push(["Accident", selectText("accident-type") + ", " + formatLong(valueOf("accident-date"))]);
      }
      clinicalRows.push(["Imaging", selectText("imaging")]);
    } else if (provider === "chen") {
      clinicalRows = [
        ["Visit for", radioSummary("visit-for")],
        ["Mobility", selectText("mobility")],
        ["Home concerns", checkedLabels("concerns")],
        ["Best time", radioSummary("home-time")]
      ];
      if (radioValue("visit-for") === "other") {
        clinicalRows.push(["Caregiver", valueOf("care-name") + ", " + valueOf("care-relation") + ", " + valueOf("care-phone")]);
      }
    } else {
      clinicalRows = [
        ["Help requested", valueOf("help-with")],
        ["Rather not see", valueOf("avoid-provider")]
      ];
    }
    root.append(reviewSection("Provider questions", 3, clinicalRows));
    root.append(reviewSection("Signature", 4, [
      ["Privacy notice", document.getElementById("privacy-ok").checked ? "Agreed" : ""],
      ["Financial policy", document.getElementById("financial-ok").checked ? "Agreed" : ""],
      ["Signed name", valueOf("signature")],
      ["Date", document.getElementById("sign-date").textContent]
    ]));
  }

  function finish() {
    var provider = radioValue("provider");
    document.getElementById("done-recap").textContent =
      expectedName() + " requested a " + radioSummary("visit-time") + " visit on " + formatLong(valueOf("visit-date")) + " with " + radioSummary("provider") + ".";
    document.getElementById("route-line").textContent = PROVIDER_ROUTE[provider] || PROVIDER_ROUTE.any;
    document.getElementById("demo-ref").textContent = demoReference();
    document.getElementById("lede").textContent = "Intake complete";
    document.getElementById("intro-copy").hidden = true;
    document.getElementById("wizard").hidden = true;
    document.getElementById("confirmation").hidden = false;
    var title = document.getElementById("done-title");
    title.focus({ preventScroll: true });
    title.scrollIntoView({ block: "start" });
  }

  function onNext() {
    syncAll();
    if (showErrors(validateStep(step))) return;
    if (step === STEPS.length - 1) {
      finish();
      return;
    }
    showStep(step + 1);
  }

  function remember(kind, file) {
    if (stored[kind] && stored[kind].url) URL.revokeObjectURL(stored[kind].url);
    var url = URL.createObjectURL(file);
    stored[kind] = { file: file, url: url };
    document.getElementById(kind + "-preview-img").src = url;
    document.getElementById(kind + "-preview-meta").textContent = file.name + ", " + formatBytes(file.size);
    document.getElementById(kind + "-preview").hidden = false;
  }

  function clearStored(kind) {
    if (stored[kind] && stored[kind].url) URL.revokeObjectURL(stored[kind].url);
    stored[kind] = null;
    var input = document.getElementById(kind === "card" ? "insurance-card" : "photo-id");
    input.value = "";
    document.getElementById(kind + "-preview").hidden = true;
    document.getElementById(kind + "-preview-img").removeAttribute("src");
    document.getElementById(kind + "-preview-meta").textContent = "";
  }

  function onFile(kind, input) {
    var file = input.files && input.files[0];
    if (!file) return;
    var problem = fileProblem(file);
    if (problem) {
      input.value = "";
      var msg = document.getElementById(input.id + "-error");
      msg.hidden = false;
      msg.textContent = problem;
      input.setAttribute("aria-invalid", "true");
      return;
    }
    clearFieldError(input.id);
    remember(kind, file);
  }

  function drawSample(kind) {
    var canvas = document.createElement("canvas");
    canvas.width = 880;
    canvas.height = 520;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#1f2c6c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#88BBD9";
    ctx.fillRect(0, 0, 22, canvas.height);
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 120px sans-serif";
    ctx.translate(560, 430);
    ctx.rotate(-0.25);
    ctx.fillText("DEMO", 0, 0);
    ctx.restore();
    ctx.fillStyle = "#ffe7cb";
    ctx.fillRect(canvas.width - 190, 40, 130, 12);
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 36px sans-serif";
    ctx.fillText(kind === "card" ? "Sample Insurance Card" : "Sample Photo ID", 56, 92);
    ctx.font = "500 18px sans-serif";
    ctx.fillStyle = "#d2e5f7";
    ctx.fillText("SAMPLE FAMILY CLINIC    NOT A REAL DOCUMENT", 56, 132);
    if (kind === "card") {
      var lines = [["MEMBER", "DEMO-100200"], ["GROUP", "SFC"], ["PLAN", "Sample PPO"], ["NAME", "Alex Sample"]];
      lines.forEach(function (pair, index) {
        var y = 200 + index * 70;
        ctx.fillStyle = "#88BBD9";
        ctx.font = "600 16px sans-serif";
        ctx.fillText(pair[0], 56, y);
        ctx.fillStyle = "#ffffff";
        ctx.font = "500 28px sans-serif";
        ctx.fillText(pair[1], 56, y + 34);
      });
    } else {
      ctx.fillStyle = "#d2e5f7";
      ctx.beginPath();
      ctx.arc(150, 300, 72, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1f2c6c";
      ctx.font = "600 40px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("AS", 150, 314);
      ctx.textAlign = "left";
      ctx.fillStyle = "#ffffff";
      ctx.font = "500 30px sans-serif";
      ctx.fillText("Alex Sample", 260, 270);
      ctx.fillStyle = "#d2e5f7";
      ctx.font = "400 22px sans-serif";
      ctx.fillText("Not a government ID", 260, 314);
      ctx.fillText("Sample only", 260, 352);
    }
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (!blob) {
          reject(new Error("sample"));
          return;
        }
        var name = kind === "card" ? "sample-insurance-card.png" : "sample-photo-id.png";
        resolve(new File([blob], name, { type: "image/png" }));
      }, "image/png");
    });
  }

  function useSample(kind) {
    var button = document.getElementById(kind === "card" ? "sample-card" : "sample-photo");
    var input = document.getElementById(kind === "card" ? "insurance-card" : "photo-id");
    button.disabled = true;
    drawSample(kind).then(function (file) {
      try {
        var transfer = new DataTransfer();
        transfer.items.add(file);
        input.files = transfer.files;
      } catch (error) {
        /* Preview still works if the file input cannot be assigned. */
      }
      clearFieldError(input.id);
      remember(kind, file);
    }).catch(function () {
      var msg = document.getElementById(input.id + "-error");
      msg.hidden = false;
      msg.textContent = "The sample image could not be created in this browser. You can attach a JPG or PNG instead.";
    }).then(function () {
      button.disabled = false;
    });
  }

  function resetFields() {
    Array.prototype.forEach.call(document.querySelectorAll("#wizard input, #wizard textarea, #wizard select"), function (node) {
      if (node.type === "radio" || node.type === "checkbox") node.checked = false;
      else if (node.type === "file") node.value = "";
      else if (node.type === "range") node.value = "5";
      else node.value = "";
    });
    document.getElementById("state").value = "UT";
    clearStored("card");
    clearStored("photo");
    clearErrors();
    syncAll();
  }

  function restart() {
    resetFields();
    document.getElementById("lede").textContent = "New patient intake";
    document.getElementById("intro-copy").hidden = false;
    document.getElementById("confirmation").hidden = true;
    document.getElementById("wizard").hidden = false;
    document.getElementById("demo-ref").textContent = "";
    showStep(0);
  }

  function setDateLimits() {
    var today = startOfToday();
    var visit = document.getElementById("visit-date");
    visit.min = isoDate(today);
    var nextYear = new Date(today);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    visit.max = isoDate(nextYear);
    var dob = document.getElementById("dob");
    dob.max = isoDate(today);
    var oldest = new Date(today);
    oldest.setFullYear(oldest.getFullYear() - 120);
    dob.min = isoDate(oldest);
    document.getElementById("accident-date").max = isoDate(today);
    document.getElementById("sign-date").textContent = today.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }

  function bind() {
    document.getElementById("next").addEventListener("click", onNext);
    document.getElementById("back").addEventListener("click", function () {
      if (step > 0) showStep(step - 1);
    });
    document.getElementById("restart").addEventListener("click", restart);
    document.getElementById("change-provider").addEventListener("click", function () { showStep(0); });
    document.getElementById("sample-card").addEventListener("click", function () { useSample("card"); });
    document.getElementById("sample-photo").addEventListener("click", function () { useSample("photo"); });
    document.getElementById("progress").addEventListener("click", function (event) {
      var button = event.target.closest("button[data-step]");
      if (!button || button.disabled) return;
      var index = Number(button.dataset.step);
      if (index < step) showStep(index);
    });
    document.getElementById("wizard").addEventListener("click", function (event) {
      var clearer = event.target.closest("[data-clear]");
      if (clearer) clearStored(clearer.dataset.clear);
    });
    document.getElementById("wizard").addEventListener("change", function (event) {
      var target = event.target;
      if (target.id) clearFieldError(target.id);
      var fieldset = target.closest("fieldset");
      if (fieldset && fieldset.id) clearFieldError(fieldset.id);
      if (target.id === "dob") syncGuardian();
      if (target.name === "coverage") syncCoverage();
      if (target.name === "provider") syncClinical();
      if (target.name === "accident") syncAccident();
      if (target.name === "visit-for") syncCare();
      if (target.name === "concerns") syncConcerns(target);
      if (target.id === "insurance-card") onFile("card", target);
      if (target.id === "photo-id") onFile("photo", target);
      if (target.id === "first-name" || target.id === "last-name") syncSignatureHint();
    });
    document.getElementById("wizard").addEventListener("input", function (event) {
      if (event.target.id === "pain-level") syncPain();
      if (event.target.id === "first-name" || event.target.id === "last-name") syncSignatureHint();
      if (event.target.id === "dob") syncGuardian();
      if (event.target.id) clearFieldError(event.target.id);
    });
    document.getElementById("wizard").addEventListener("keydown", function (event) {
      if (event.key !== "Enter" || event.shiftKey || event.altKey || event.metaKey || event.ctrlKey) return;
      var target = event.target;
      if (!target.matches || target.matches("textarea, button, a")) return;
      if (target.matches("input, select")) {
        event.preventDefault();
        onNext();
      }
    });
  }

  setDateLimits();
  bind();
  showStep(0, { focus: false });
})();

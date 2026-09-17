// autofill.js - Runs on Microsoft Forms
console.log("Runway Form Auto-Filler: Autofill script injected.");

// Helper to simulate React input events
function setNativeValue(element, value) {
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
  
  if (valueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else {
    valueSetter.call(element, value);
  }
  element.dispatchEvent(new Event('input', { bubbles: true }));
}

function findInputByQuestionText(questionText) {
  // MS Forms uses spans or divs for question titles
  const elements = Array.from(document.querySelectorAll('span, div')).filter(el => {
    return el.textContent && el.textContent.toLowerCase().includes(questionText.toLowerCase());
  });
  
  if (elements.length === 0) return null;
  
  // Find the closest parent that contains the input
  let parent = elements[0].closest('[data-automation-id="questionItem"]');
  if (!parent) {
      // Fallback if data-automation-id is not found
      parent = elements[0].parentElement.parentElement.parentElement;
  }
  
  if (parent) {
    return parent.querySelector('input[type="text"], input[type="tel"], input[type="email"], textarea');
  }
  return null;
}

function clickRadioOrCheckboxByLabel(labelText) {
  const elements = Array.from(document.querySelectorAll('span, label, div')).filter(el => {
    return el.textContent && el.textContent.trim().toLowerCase() === labelText.toLowerCase();
  });
  
  if (elements.length > 0) {
    const clickable = elements[0].closest('[role="radio"], [role="checkbox"], label');
    if (clickable) {
      clickable.click();
      return true;
    }
  }
  return false;
}

function autofill() {
  chrome.storage.local.get(['runway_profile', 'runway_today_sub'], (result) => {
    const profile = result.runway_profile;
    const todaySub = result.runway_today_sub;
    
    if (!profile) {
      console.log("Runway Form Auto-Filler: No profile found to fill.");
      return;
    }

    console.log("Runway Form Auto-Filler: Attempting to fill...", profile, todaySub);

    // 1. Full Name
    const nameInput = findInputByQuestionText('Full Name');
    if (nameInput && !nameInput.value) setNativeValue(nameInput, profile.full_name);

    // 2. Startup Name
    const startupInput = findInputByQuestionText('Startup Name');
    if (startupInput && !startupInput.value) setNativeValue(startupInput, profile.startup_name);

    // 3. Incubation Status (Radio)
    clickRadioOrCheckboxByLabel(profile.incubation_status);

    // 4. Mobile Number
    const mobileInput = findInputByQuestionText('Mobile Number');
    if (mobileInput && !mobileInput.value) setNativeValue(mobileInput, profile.mobile_number);

    // 5. Email Address
    const emailInput = findInputByQuestionText('Email Address');
    if (emailInput && !emailInput.value) setNativeValue(emailInput, profile.email);

    if (todaySub) {
      // 6. Purpose (Checkbox list)
      if (Array.isArray(todaySub.purpose)) {
        todaySub.purpose.forEach(p => clickRadioOrCheckboxByLabel(p));
      }

      // 7. Seat Number (Usually a text input or dropdown. If MS Forms uses a dropdown, it might need special handling. Text input fallback:)
      const seatInput = findInputByQuestionText('Seat Number Used');
      if (seatInput && !seatInput.value) setNativeValue(seatInput, todaySub.seat_number);

      // 8. Total Duration (Radio)
      clickRadioOrCheckboxByLabel(todaySub.duration);

      // 9. Team members (Radio)
      clickRadioOrCheckboxByLabel(todaySub.team_members);

      // 10. Feedback
      const feedbackInput = findInputByQuestionText('Any issues or feedback');
      if (feedbackInput && !feedbackInput.value && todaySub.feedback) {
        setNativeValue(feedbackInput, todaySub.feedback);
      }
    }
  });
}

// MS Forms takes time to load. Try filling periodically until done.
// In a real app we'd use MutationObserver, but this is simpler for MVP
let attempts = 0;
const interval = setInterval(() => {
  attempts++;
  // Only try if the page seems to have loaded the form
  if (document.querySelector('input')) {
    autofill();
  }
  
  if (attempts > 15) {
    clearInterval(interval);
  }
}, 1000);

document.addEventListener('DOMContentLoaded', () => {
    const statusText = document.getElementById("statusText");
    const statusIndicator = document.getElementById("statusIndicator");
    const button = document.getElementById("toggleButton");
    const confirmationDiv = document.getElementById("confirmation");
    const confirmationInput = document.getElementById("confirmationInput");
    const confirmButton = document.getElementById("confirmButton");

    function updateUI(blockingEnabled) {
        if (blockingEnabled) {
            statusText.textContent = "Blocking Enabled";
            statusIndicator.style.backgroundColor = "#28a745";
            button.textContent = "Disable Blocking";
            button.classList.add('active');
            button.classList.remove('inactive');
        } else {
            statusText.textContent = "Blocking Disabled";
            statusIndicator.style.backgroundColor = "#dc3545";
            button.textContent = "Enable Blocking";
            button.classList.add('inactive');
            button.classList.remove('active');
        }
    }

    function handleError(error) {
        console.error("Error:", error);
        const errorMessage = error.message || "An unknown error occurred.";
        confirmationDiv.innerHTML = `<p class="error">${errorMessage}</p>`;
    }

    chrome.storage.local.get("blockingEnabled", ({ blockingEnabled }) => {
        if (chrome.runtime.lastError) {
            handleError(chrome.runtime.lastError);
        } else {
            updateUI(blockingEnabled);
        }
    });

    button.addEventListener("click", () => {
        confirmationDiv.classList.remove('hidden');
    });

    confirmButton.addEventListener("click", () => {
        const userInput = confirmationInput.value.trim().toLowerCase();
        const requiredText = "i promise to be productive after this";

        const normalizedInput = userInput.replace(/\./g, '').replace(/\s+/g, ' ');
        if (normalizedInput === requiredText) {
            chrome.storage.local.get("blockingEnabled", ({ blockingEnabled }) => {
                if (chrome.runtime.lastError) {
                    handleError(chrome.runtime.lastError);
                    return;
                }
                const newStatus = !blockingEnabled;
                chrome.storage.local.set({ blockingEnabled: newStatus }, () => {
                    chrome.runtime.sendMessage({ type: "toggleBlocking", status: newStatus }, (response) => {
                        if (chrome.runtime.lastError) {
                            handleError(chrome.runtime.lastError);
                            return;
                        }
                        if (response && response.success) {
                            updateUI(newStatus);
                            confirmationDiv.classList.add('hidden');
                        } else {
                            handleError(new Error("Failed to toggle blocking or response missing"));
                        }
                    });
                });
            });
        } else {
            confirmationDiv.classList.add('error');
            confirmationDiv.innerHTML = `
                <p class="error">The text you entered is incorrect or has a typo. Please try again.</p>
                <p>Please type the following to confirm:</p>
                <p id="confirmationText" class="no-copy">I promise to be productive after this.</p>
                <input type="text" id="confirmationInput" placeholder="Type here...">
                <button id="confirmButton" class="confirm-button">Confirm</button>
            `;
        }
    });
});

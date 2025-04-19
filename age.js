const ageSelect = document.getElementById('age');
for (let i = 18; i <= 99; i++) {
const option = document.createElement('option');
option.value = i;
option.textContent = i;
ageSelect.appendChild(option);
}

const option100plus = document.createElement('option');
option100plus.value = "100+";
option100plus.textContent = "100+";
ageSelect.appendChild(option100plus);
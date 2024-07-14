import { db, storage } from './firebaseConfig.js';
import { collection, addDoc, query, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('save-button');
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            const formData = new FormData(document.getElementById('diagnostic-form'));
            const data = {};
            let pendingFiles = 0;

            formData.forEach((value, key) => {
                if (value instanceof File && value.size > 0) {
                    pendingFiles++;
                    compressAndUploadImage(value, key, url => {
                        data[key] = url;
                        pendingFiles--;
                        if (pendingFiles === 0) {
                            addFullNameAndSave(data);
                        }
                    });
                } else {
                    data[key] = value;
                }
            });

            if (pendingFiles === 0) {
                addFullNameAndSave(data);
            }
        });
    }

    const savedDiagnosticsElement = document.getElementById('saved-diagnostics');
    if (savedDiagnosticsElement) {
        displaySavedDiagnostics();
    }
});

function compressAndUploadImage(file, elementId, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            let width = img.width;
            let height = img.height;
            let scale = Math.min(800 / width, 600 / height);
            width *= scale;
            height *= scale;
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(blob => {
                const storageRef = ref(storage, `images/${elementId}-${Date.now()}`);
                uploadBytes(storageRef, blob).then(snapshot => {
                    getDownloadURL(snapshot.ref).then(downloadURL => {
                        callback(downloadURL);
                    });
                });
            }, 'image/jpeg', 0.7);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

async function addFullNameAndSave(data) {
    const timestamp = new Date().toLocaleString();
    const emplacement = document.getElementById('emplacement').value || 'Unknown';
    const denomination = document.getElementById('denomination').value || 'Unnamed';
    const fullName = `${timestamp} - ${emplacement} - ${denomination}`;
    data['fullName'] = fullName;

    try {
        await addDoc(collection(db, "datas"), data);
        alert(`Diagnostic sauvegardé sous le nom: ${fullName}`);
    } catch (e) {
        console.error("Erreur lors de la sauvegarde du diagnostic : ", e);
    }
}

function displaySavedDiagnostics() {
    const q = query(collection(db, "datas"));
    const displayElement = document.getElementById('saved-diagnostics');

    onSnapshot(q, (querySnapshot) => {
        displayElement.innerHTML = '';
        if (querySnapshot.empty) {
            displayElement.innerHTML = '<p>Aucun diagnostic sauvegardé.</p>';
        } else {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const section = document.createElement('div');
                section.className = 'section';
                section.innerHTML = `<h2>${data.fullName}</h2>`;
                
                const table = document.createElement('table');
                table.className = 'diagnostic-table';
                const tbody = document.createElement('tbody');
                
                for (const key in data) {
                    if (key !== 'fullName') {
                        const tr = document.createElement('tr');
                        const tdLabel = document.createElement('td');
                        const tdValue = document.createElement('td');
                        
                        const labelElement = document.querySelector(`[name="${key}"]`);
                        const label = labelElement ? labelElement.getAttribute('data-label') : key;
                        
                        tdLabel.textContent = label;
                        tdLabel.className = 'diagnostic-label';
                        
                        if (key.startsWith('photo-')) {
                            const img = document.createElement('img');
                            img.src = data[key];
                            img.style.maxWidth = '200px';
                            tdValue.appendChild(img);
                        } else {
                            tdValue.textContent = data[key];
                        }
                        
                        tr.appendChild(tdLabel);
                        tr.appendChild(tdValue);
                        tbody.appendChild(tr);
                    }
                }
                table.appendChild(tbody);
                section.appendChild(table);

                displayElement.appendChild(section);
            });
        }
    });
}


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
                    compressAndPreviewImage(value, key, base64 => {
                        data[key] = base64;
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

function compressAndPreviewImage(file, elementId, callback) {
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
            const dataurl = canvas.toDataURL("image/jpeg", 0.7);
            document.getElementById('preview-' + elementId).src = dataurl;
            document.getElementById('preview-' + elementId).style.display = 'block';
            callback(dataurl);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Fonction pour ajouter un nom complet aux données et les sauvegarder
function addFullNameAndSave(data) {
    const timestamp = new Date().toLocaleString();  // Obtenir l'horodatage actuel
    const emplacement = document.getElementById('emplacement').value || 'Unknown';
    const denomination = document.getElementById('denomination').value || 'Unnamed';
    const fullName = `${timestamp} - ${emplacement} - ${denomination}`;  // Créer le nom complet
    data['fullName'] = fullName;  // Ajouter le nom complet aux données

    // Récupérer les diagnostics sauvegardés du localStorage, ou initialiser un tableau vide
    let savedDiagnostics = JSON.parse(localStorage.getItem('savedDiagnostics')) || [];
    savedDiagnostics.push(data);  // Ajouter les nouvelles données
    localStorage.setItem('savedDiagnostics', JSON.stringify(savedDiagnostics));  // Sauvegarder dans le localStorage
    alert(`Diagnostic sauvegardé sous le nom: ${fullName}`);  // Afficher une alerte de confirmation
}

// Fonction pour afficher les diagnostics sauvegardés
function displaySavedDiagnostics() {
    // Récupérer les diagnostics sauvegardés du localStorage
    const savedDiagnostics = JSON.parse(localStorage.getItem('savedDiagnostics') || '[]');
    const displayElement = document.getElementById('saved-diagnostics');  // Élément où afficher les diagnostics
    
    if (savedDiagnostics.length === 0) {
        displayElement.innerHTML = '<p>Aucun diagnostic sauvegardé.</p>';  // Message si aucun diagnostic sauvegardé
    } else {
        // Créer un formulaire temporaire pour récupérer les labels des champs
        const tempForm = document.createElement('form');
        tempForm.innerHTML = `
            <input type="text" name="denomination" data-label="Dénomination">
            <input type="text" name="modele" data-label="Modèle">
            <input type="number" name="puissance" data-label="Puissance (kW)">
            <select name="type-gaz" data-label="Type de gaz"></select>
            <input type="number" name="poids-gaz" data-label="Quantité gaz (kg)">            
            <input type="text" name="emplacement" data-label="Emplacement">
            <input type="number" name="temp-ambiante" data-label="Température ambiante intérieure">
            <input type="number" name="temp-exterieure" data-label="Température extérieure">
            <input type="number" name="evap-air-in" data-label="Entrée évaporateur (air)">
            <input type="number" name="evap-air-out" data-label="Sortie évaporateur (air)">
            <input type="number" name="cond-air-in" data-label="Entrée condenseur (air)">
            <input type="number" name="cond-air-out" data-label="Sortie condenseur (air)">
            <input type="number" name="evap-pipe-out" data-label="Sortie évaporateur (tuyau)">
            <input type="number" name="cond-pipe-out" data-label="Sortie condenseur (tuyau)">
            <input type="number" name="comp-discharge" data-label="Refoulement compresseur">
            <input type="number" name="bp-off" data-label="Pression BP à l'arrêt">
            <input type="number" name="bp-on" data-label="Pression BP en fonctionnement">
            <input type="number" name="hp-on" data-label="Pression HP en fonctionnement">
            <input type="number" name="hp-off" data-label="Pression HP à l'arrêt">
            <input type="number" name="bp-temp" data-label="Température BP">
            <input type="number" name="hp-temp" data-label="Température HP">
            <input type="number" name="amp-demarrage" data-label="Ampérage au démarrage">
            <input type="number" name="amp-fonctionnement" data-label="Ampérage en fonctionnement">
            <input type="file" name="photo-unite" data-label="Unité complète">
            <input type="file" name="photo-evaporateur" data-label="Évaporateur">
            <input type="file" name="photo-condenseur" data-label="Condenseur">
            <input type="file" name="photo-compresseur" data-label="Compresseur">
            <input type="file" name="photo-plaque-interieure" data-label="Plaque signalétique unité intérieure">
            <input type="file" name="photo-plaque-exterieure" data-label="Plaque signalétique unité extérieure">
        `;
        document.body.appendChild(tempForm);  // Ajouter le formulaire temporaire au DOM

        // Parcourir les diagnostics sauvegardés et les afficher
        savedDiagnostics.forEach((data, index) => {
            const section = document.createElement('div');
            section.className = 'section';
            section.innerHTML = `<h2>${data.fullName}</h2>`;

            const table = document.createElement('table');
            table.className = 'diagnostic-table';
            const tbody = document.createElement('tbody');

            // Parcourir les champs de données et les afficher dans une table
            for (const key in data) {
                if (key !== 'fullName') {
                    const tr = document.createElement('tr');
                    const tdLabel = document.createElement('td');
                    const tdValue = document.createElement('td');

                    // Récupérer le label du champ
                    const labelElement = tempForm.querySelector(`[name="${key}"]`);
                    const label = labelElement ? labelElement.getAttribute('data-label') : key;

                    tdLabel.textContent = label;
                    tdLabel.className = 'diagnostic-label';

                    // Si le champ est une photo, afficher l'image
                    if (key.startsWith('photo-')) {
                        const img = document.createElement('img');
                        img.src = data[key];
                        img.style.maxWidth = '200px';
                        tdValue.appendChild(img);
                    } else {
                        // Sinon, afficher la valeur du champ
                        tdValue.textContent = data[key];
                    }

                    tr.appendChild(tdLabel);
                    tr.appendChild(tdValue);
                    tbody.appendChild(tr);
                }
            }
            table.appendChild(tbody);
            section.appendChild(table);

            // Ajouter un bouton de suppression pour chaque diagnostic
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Supprimer';
            deleteButton.className = 'delete-button';
            deleteButton.addEventListener('click', function() {
                // Supprimer le diagnostic du tableau et du localStorage
                savedDiagnostics.splice(index, 1);
                localStorage.setItem('savedDiagnostics', JSON.stringify(savedDiagnostics));
                location.reload();  // Recharger la page pour mettre à jour l'affichage
            });
            section.appendChild(deleteButton);

            displayElement.appendChild(section);
        });

        tempForm.remove();  // Supprimer le formulaire temporaire du DOM
    }
}

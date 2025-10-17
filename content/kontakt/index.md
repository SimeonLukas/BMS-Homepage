+++
title="Kontakt"
date ="2023-01-01"
template = "toppage.html"
description="Bürgermeister-Schütte Grund- und Mittelschule"
+++

Hindenburgstraße 10    
82467 Garmisch-Partenkirchen

<div class="triple contacts">
<div>{{person(name = "Rektorin Stefanie Schmidt" , phone="+49 8821 9103500" , mail="schulleitung@volksschule-partenkirchen.de")}}</div>
<div>{{person(name = "Sekretariat" , phone="+49 8821 9103500" , mail="sekretariat@volksschule-partenkirchen.de")}}</div>
</div>

---

<div class="triple contacts">
<div>{{person(name = "Homepage Simeon Stanek" , phone="+49 1774 419070" , mail="simeon@staneks.de")}}</div>
<div>{{person(name = "Förderverein Markus Hirthammer" , phone="+49 8821 55599" , mail="markus.hirthammer@gmail.com")}}</div>
</div>


---

   <div class="email-generator">
   <h3>Dienst-Emails</h3>
<div class="info-text">
Das Lehrerkollegium kann per dienstlicher E-Mail kontaktiert werden. 
Die Dienst-Email setzt sich zusammen aus: <strong>Nachname.Erster Buchstabe des Vornamens@vs-p.de</strong>
<br><span class="example">Beispiel: mustermann.m@vs-p.de</span>
    </div>
 <div class="input-group">
            <label for="nachname">Nachname:</label><br>
            <input type="text" style="width: 100%;" id="nachname" placeholder="z.B. Mustermann" />
        </div>
 <div class="input-group">
            <label for="vorname">Vorname:</label><br>
            <input type="text" style="width: 100%;" id="vorname" placeholder="z.B. Max" />
        </div>
<div class="email-result">
            <strong>Generierte E-Mail-Adresse:</strong>
            <div id="email-output">
                <em>Bitte geben Sie Vor- und Nachname ein...</em>
            </div>
        </div>
    </div>
<script>
        function generateEmail() {
            const nachnameInput = document.getElementById('nachname');
            const vornameInput = document.getElementById('vorname');
            const emailOutput = document.getElementById('email-output');
            const nachname = nachnameInput.value.trim().toLowerCase();
            const vorname = vornameInput.value.trim().toLowerCase();
            if (nachname && vorname) {
 // Umlaute und Sonderzeichen behandeln
                const cleanNachname = nachname
                    .replace(/ä/g, 'ae')
                    .replace(/ö/g, 'oe')
                    .replace(/ü/g, 'ue')
                    .replace(/ß/g, 'ss')
                    .replace(/[^a-z]/g, '');
                const cleanVorname = vorname
                    .replace(/ä/g, 'ae')
                    .replace(/ö/g, 'oe')
                    .replace(/ü/g, 'ue')
                    .replace(/ß/g, 'ss')
                    .replace(/[^a-z]/g, '');
                if (cleanNachname && cleanVorname) {
                    const email = `${cleanNachname}.${cleanVorname.charAt(0)}@vs-p.de`;
                    emailOutput.innerHTML = `
                        <span class="email-address">${email}</span>
                        <button style="border-radius: 5px; background-color: #007cba; color: #fff; border: none; padding: 5px 10px;" class="copy-button" onclick="copyToClipboard('${email}')">Kopieren</button>
                    `;
                } else {
                    emailOutput.innerHTML = '<em style="color: #d32f2f;">Ungültige Zeichen in Namen. Bitte nur Buchstaben verwenden.</em>';
                }
            } else {
                emailOutput.innerHTML = '<em>Bitte geben Sie Vor- und Nachname ein...</em>';
            }
        }
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(function() {
                // Visuelles Feedback
                const button = document.querySelector('.copy-button');
                const originalText = button.textContent;
                button.textContent = 'Kopiert!';
                button.style.backgroundColor = '#62b32e';
                 setTimeout(() => {
                    button.textContent = originalText;
                    button.style.backgroundColor = '#007cba';
                }, 1500);
            }).catch(function(err) {
                console.error('Fehler beim Kopieren: ', err);
                alert('Fehler beim Kopieren in die Zwischenablage');
            });
        }
        document.getElementById('nachname').addEventListener('input', generateEmail);
        document.getElementById('vorname').addEventListener('input', generateEmail);
    generateEmail();
    </script>
    </div>

export default {
    id: "docs.components",
    nome: "",
    sezioni: [
        {
            titolo: "Come usare OBI Components",
            descrizione: `Importazione di OBI Components`,
            note: `
OBI Components è il pacchetto di componenti standard per la progettazione di interfacce per applicativi OBI.
I componenti sono basati su Lampredotto JS.
Per usare i componenti OBI basta copiare il codice sotto all'interno dell'header della pagina principale del progetto.
                        `,
            codice: `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,300,0,-25" />
<link type='text/css' rel='stylesheet' href='http://swita000006.de.obi.net/_webframework/OBIComponents/style/StyleBundle.css'>
<script type='module' src='http://swita000006.de.obi.net/_webframework/OBIComponents/componentsBundle.js'></scr` + `ipt>
    `,
        }
    ]
}
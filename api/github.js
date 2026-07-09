// ============================================
// api/github.js
// Funciones auxiliares para GitHub API
// Espacio Oliva
// ============================================

const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH || "main";
const TOKEN = process.env.GITHUB_TOKEN;

const HEADERS = {
    Authorization: `Bearer ${TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json"
};

//----------------------------------------------
// Verifica configuración
//----------------------------------------------

export function checkConfig() {

    if (!OWNER)
        throw new Error("Falta GITHUB_OWNER");

    if (!REPO)
        throw new Error("Falta GITHUB_REPO");

    if (!TOKEN)
        throw new Error("Falta GITHUB_TOKEN");
}

//----------------------------------------------
// Obtiene un archivo
//----------------------------------------------

export async function getFile(path){

    checkConfig();

    const url =
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`;

    const response = await fetch(url,{
        headers:HEADERS
    });

    if(response.status===404){
        return null;
    }

    if(!response.ok){
        throw new Error("GitHub respondió " + response.status);
    }

    return await response.json();

}

//----------------------------------------------
// Descarga el contenido Base64
//----------------------------------------------

export async function getBase64(path){

    const file = await getFile(path);

    if(!file)
        return null;

    return file.content.replace(/\n/g,"");

}

//----------------------------------------------
// Obtiene SHA
//----------------------------------------------

export async function getSHA(path){

    const file = await getFile(path);

    if(!file)
        return null;

    return file.sha;

}

//----------------------------------------------
// Guarda o reemplaza archivo
//----------------------------------------------

export async function saveFile(path,base64,message){

    checkConfig();

    const sha = await getSHA(path);

    const url =
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;

    const body = {
        message: message,
        content: base64,
        branch: BRANCH
    };

    if(sha){
        body.sha = sha;
    }

    const response = await fetch(url,{
        method:"PUT",
        headers:HEADERS,
        body:JSON.stringify(body)
    });

    const json = await response.json();

    if(!response.ok){

        throw new Error(JSON.stringify(json));

    }

    return json;

}

//----------------------------------------------
// Elimina archivo
//----------------------------------------------

export async function deleteFile(path,message){

    checkConfig();

    const sha = await getSHA(path);

    if(!sha)
        throw new Error("No existe el archivo.");

    const url =
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;

    const response = await fetch(url,{
        method:"DELETE",
        headers:HEADERS,
        body:JSON.stringify({
            message,
            sha,
            branch:BRANCH
        })
    });

    const json = await response.json();

    if(!response.ok){

        throw new Error(JSON.stringify(json));

    }

    return json;

}

//----------------------------------------------
// Lista archivos de una carpeta
//----------------------------------------------

export async function listFolder(folder){

    checkConfig();

    const url =
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${folder}?ref=${BRANCH}`;

    const response = await fetch(url,{
        headers:HEADERS
    });

    if(!response.ok){

        throw new Error("No se pudo listar la carpeta.");

    }

    return await response.json();

}

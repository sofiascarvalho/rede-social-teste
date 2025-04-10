const API_BASE_URL = "https://back-spider.vercel.app/publicacoes";
const API_USERS_URL = "https://back-spider.vercel.app/user/listarUsers";
const API_LOGIN_URL = "https://back-spider.vercel.app/l";
const API_REGISTER_URL = "https://back-spider.vercel.app/user/cadastrarUser";
const API_STORY_URL = "https://back-spider.vercel.app/storys/listarStorys";
const API_LIKE_STORY_URL = "https://back-spider.vercel.app/storys/likeStory";
const API_CREATE_STORY_URL = "https://back-spider.vercel.app/storys/cadastrarStorys";
const API_REMEMBER_PASSWORD_URL = "https://back-spider.vercel.app/user/RememberPassword";
const API_NEW_PASSWORD_URL = "https://back-spider.vercel.app/user/newPassword";
const API_DELETE_USER_URL = "https://back-spider.vercel.app/user/deleteUser";
const API_UPDATE_USER_URL = "https://back-spider.vercel.app/user/atualizarUser";

document.addEventListener("DOMContentLoaded", () => {
    carregarPublicacoes();
    carregarStories();
});

async function carregarPublicacoes() {
    try {
        const [resPublicacoes, resUsuarios] = await Promise.all([
            fetch(`${API_BASE_URL}/listarPublicacoes`),
            fetch(`${API_USERS_URL}`)
        ]);

        if (!resPublicacoes.ok || !resUsuarios.ok) {
            throw new Error("Erro ao buscar dados da API");
        }

        const publicacoes = await resPublicacoes.json();
        const usuarios = await resUsuarios.json();

        const main = document.querySelector("main");
        main.innerHTML = "";

        publicacoes.forEach(publicacao => {
            const usuario = usuarios.find(user => user.id === publicacao.userId) || {};
            const postContainer = document.createElement("div");
            postContainer.classList.add("post-container");
            postContainer.innerHTML = `
                <div class="post-header">
                    <img src="${usuario.avatar || './img/default-avatar.jpg'}" alt="${usuario.nome || 'Usuário'}" class="post-profile">
                    <span>${usuario.nome || "Usuário Desconhecido"}</span>
                    <span class="date">${new Date(publicacao.data).toLocaleDateString()}</span>
                </div>
                <div class="post-content">
                    <img src="${publicacao.imagem || './img/default.jpg'}" alt="Imagem do post">
                    <div class="post-text">
                        <p><strong>${usuario.nome || "Usuário"}</strong></p>
                        <p>${publicacao.texto}</p>
                    </div>
                </div>
                <div class="comment-section">
                    <div class="comment-input-container">
                        <input type="text" placeholder="Digite seu comentário..." id="commentInput${publicacao.id}">
                        <button class="comment-btn" onclick="adicionarComentario(${publicacao.id})">Comentar</button>
                    </div>
                    <div class="comments" id="comments${publicacao.id}">
                        ${publicacao.comentarios && publicacao.comentarios.length > 0
                            ? publicacao.comentarios.map(comentario => `
                                <p><strong>${comentario.usuario || "Anônimo"}</strong> ${comentario.texto}</p>
                              `).join('')
                            : "<p>Sem comentários ainda.</p>"
                        }
                    </div>
                </div>
                <div class="like" id="like${publicacao.id}" onclick="curtirPublicacao(${publicacao.id})">❤️ ${publicacao.likes || 0}</div>
                <button class="delete-btn" onclick="deletarPublicacao(${publicacao.id})">Excluir</button>
            `;
            main.appendChild(postContainer);
        });
    } catch (erro) {
        console.error("Erro ao carregar publicações:", erro);
    }
}

async function carregarStories() {
    try {
        const resposta = await fetch(API_STORY_URL);
        const stories = await resposta.json();

        const storiesContainer = document.querySelector("#stories");
        storiesContainer.innerHTML = "";

        stories.forEach(story => {
            const storyElement = document.createElement("div");
            storyElement.classList.add("story");
            storyElement.innerHTML = `
                <img src="${story.imagem || './img/default-story.jpg'}" alt="Story">
                <button onclick="curtirStory(${story.id})">Curtir ❤️ ${story.likes}</button>
            `;
            storiesContainer.appendChild(storyElement);
        });
    } catch (erro) {
        console.error("Erro ao carregar stories:", erro);
    }
}

async function curtirStory(storyId) {
    try {
        const resposta = await fetch(`${API_LIKE_STORY_URL}/${storyId}`, {
            method: "PUT"
        });
        if (resposta.ok) carregarStories();
    } catch (erro) {
        console.error("Erro ao curtir story:", erro);
    }
}

async function adicionarComentario(postId) {
    const input = document.getElementById(`commentInput${postId}`);
    const texto = input.value.trim();
    if (!texto) return;

    try {
        const resposta = await fetch(`${API_BASE_URL}/atualizarPublicacao/${postId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ comentario: { usuario: "Usuário", texto } })
        });

        if (resposta.ok) {
            input.value = "";
            carregarPublicacoes();
        }
    } catch (erro) {
        console.error("Erro ao adicionar comentário:", erro);
    }
}

async function deletarPublicacao(postId) {
    try {
        const resposta = await fetch(`${API_BASE_URL}/deletarPublicacao/${postId}`, {
            method: "DELETE"
        });

        if (resposta.ok) {
            carregarPublicacoes();
        }
    } catch (erro) {
        console.error("Erro ao deletar publicação:", erro);
    }
}

import {
    addLike,
    createComment,
    createPost,
    listComments,
    listFeed,
    listPosts,
} from "./posts-api.js"

const modalElement = document.querySelector("#post-modal")
const postFormElement = document.querySelector("#post-form")
const feedElement = document.querySelector("#feed")
const openModalButton = document.querySelector("[data-open-modal]")
const closeModalButton = document.querySelector("[data-close-modal]")
const refreshFeedButton = document.querySelector("#refresh-feed")
const feedModeElement = document.querySelector("#feed-mode")
const feedCategoryElement = document.querySelector("#feed-category")
const postCategoryElement = document.querySelector("#post-category")

const state = {
    posts: [],
    commentsByPost: {},
    mode: "latest",
    categories: [],
    feedCategoryId: null,
}

const clearElement = (element) => {
    while (element.firstChild) {
        element.removeChild(element.firstChild)
    }
}

const isValidHttpUrl = (candidate) => {
    try {
        const parsedUrl = new URL(candidate)
        return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:"
    } catch {
        return false
    }
}

const renderComments = (postId, container) => {
    const comments = state.commentsByPost[postId] || []

    clearElement(container)

    if (comments.length === 0) {
        const empty = document.createElement("p")
        empty.className = "text-xs text-zinc-500"
        empty.textContent = "Sin comentarios"
        container.appendChild(empty)
        return
    }

    comments.slice(0, 5).forEach((comment) => {
        const item = document.createElement("p")
        item.className = "rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-700"
        item.textContent = comment.content
        container.appendChild(item)
    })
}

const renderFeed = () => {
    if (!feedElement) {
        return
    }

    clearElement(feedElement)

    if (state.posts.length === 0) {
        const emptyNode = document.createElement("p")
        emptyNode.className =
            "col-span-full rounded border border-zinc-300 bg-white px-6 py-4 text-sm text-zinc-600"
        emptyNode.textContent = "No hay posts todavia."
        feedElement.appendChild(emptyNode)
        return
    }

    state.posts.forEach((post) => {
        const card = document.createElement("article")
        card.className =
            "w-full max-w-[380px] rounded border border-zinc-300 bg-white shadow-sm"

        const image = document.createElement("img")
        image.className = "h-72 w-full object-cover bg-zinc-200"
        image.src = post.imageUrl
        image.alt = post.title
        image.loading = "lazy"

        const body = document.createElement("div")
        body.className = "space-y-3 p-4"

        const title = document.createElement("h3")
        title.className = "text-lg font-semibold text-zinc-900"
        title.textContent = post.title

        const description = document.createElement("p")
        description.className = "text-sm leading-6 text-zinc-700"
        description.textContent = post.description

        if (post.category) {
            const categoryBadge = document.createElement("span")
            categoryBadge.className =
                "inline-block rounded bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600"
            categoryBadge.textContent = post.category
            body.appendChild(categoryBadge)
        }

        const stats = document.createElement("div")
        stats.className = "grid grid-cols-3 gap-2 text-center text-xs"

        const likesButton = document.createElement("button")
        likesButton.type = "button"
        likesButton.className =
            "inline-flex items-center justify-center gap-1 rounded border border-zinc-900 bg-zinc-900 px-2 py-1 text-white"
        likesButton.innerHTML = `<i class="bi bi-heart-fill"></i><span>${post.likesCount || 0}</span>`

        likesButton.addEventListener("click", async () => {
            try {
                await addLike(post.id, {
                    reactionType: "like",
                    weight: 1,
                })
                await refreshFeed()
            } catch (error) {
                alert(
                    error instanceof Error ? error.message : "Error al dar like",
                )
            }
        })

        const commentsCount = document.createElement("span")
        commentsCount.className =
            "rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-zinc-600"
        commentsCount.textContent = `Comentarios ${post.commentsCount || 0}`

        const relevanceScore = document.createElement("span")
        relevanceScore.className =
            "rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-zinc-600"
        relevanceScore.textContent = `Relevancia ${post.relevanceScore || 0}`

        stats.appendChild(likesButton)
        stats.appendChild(commentsCount)
        stats.appendChild(relevanceScore)

        const commentsTitle = document.createElement("p")
        commentsTitle.className =
            "inline-flex items-center gap-2 text-xs font-semibold uppercase text-zinc-500"
        commentsTitle.innerHTML =
            '<i class="bi bi-chat-left-text"></i><span>Comentarios</span>'

        const commentsContainer = document.createElement("div")
        commentsContainer.className =
            "max-h-32 space-y-1 overflow-y-auto rounded border border-zinc-200 bg-zinc-50 p-2 pr-1"
        renderComments(post.id, commentsContainer)

        const commentForm = document.createElement("form")
        commentForm.className = "flex gap-2"

        const commentInput = document.createElement("input")
        commentInput.className =
            "w-full rounded border border-zinc-300 px-2 py-1 text-xs outline-none"
        commentInput.placeholder = "Escribe un comentario"

        const commentButton = document.createElement("button")
        commentButton.className =
            "inline-flex items-center gap-1 rounded border border-zinc-900 bg-zinc-900 px-3 py-1 text-xs text-white"
        commentButton.type = "submit"
        commentButton.innerHTML = '<i class="bi bi-send"></i><span>Enviar</span>'

        commentForm.appendChild(commentInput)
        commentForm.appendChild(commentButton)

        commentForm.addEventListener("submit", async (event) => {
            event.preventDefault()
            const content = commentInput.value.trim()
            if (!content) {
                return
            }

            if (content.length < 2) {
                alert("Comentario demasiado corto")
                return
            }

            try {
                await createComment(post.id, { content })
                commentInput.value = ""
                await refreshFeed()
            } catch (error) {
                alert(
                    error instanceof Error
                        ? error.message
                        : "Error al crear comentario",
                )
            }
        })

        body.appendChild(title)
        body.appendChild(description)
        body.appendChild(stats)
        body.appendChild(commentsTitle)
        body.appendChild(commentsContainer)
        body.appendChild(commentForm)

        card.appendChild(image)
        card.appendChild(body)

        feedElement.appendChild(card)
    })
}

const openModal = () => {
    if (modalElement) {
        modalElement.showModal()
    }
}

const closeModal = () => {
    if (modalElement) {
        modalElement.close()
    }

    if (postFormElement) {
        postFormElement.reset()
    }
}

const loadCommentsForPost = async (postId) => {
    const response = await listComments(postId)
    if (response && Array.isArray(response.comments)) {
        state.commentsByPost[postId] = response.comments
    }
}

const handleCreatePost = async () => {
    if (!postFormElement) {
        return
    }

    const formData = new FormData(postFormElement)
    const payload = {
        title: String(formData.get("title") || "").trim(),
        description: String(formData.get("description") || "").trim(),
        imageUrl: String(formData.get("imageUrl") || "").trim(),
    }

    const catValue = postCategoryElement?.value
    if (catValue) {
        payload.categoryId = catValue
    }

    if (!payload.title || !payload.description || !payload.imageUrl) {
        throw new Error("Completa todos los campos")
    }

    if (!isValidHttpUrl(payload.imageUrl)) {
        throw new Error("La URL de imagen debe ser valida")
    }

    await createPost(payload)
}

const refreshFeed = async () => {
    try {
        const listResponse = await listPosts()
        const listItems = Array.isArray(listResponse)
            ? listResponse
            : listResponse?.items

        if (!Array.isArray(listItems)) {
            throw new Error("Error al cargar posts")
        }

        const feedResponse = await listFeed(state.mode, state.feedCategoryId)
        const feedRows = Array.isArray(feedResponse)
            ? feedResponse
            : feedResponse?.rows

        if (!Array.isArray(feedRows)) {
            throw new Error("Error al cargar feed")
        }

        state.posts = feedRows

        for (const post of state.posts) {
            await loadCommentsForPost(post.id)
        }

        renderFeed()
    } catch (error) {
        alert(
            error instanceof Error ? error.message : "No se pudo cargar",
        )
    }
}

const bindEvents = () => {
    openModalButton?.addEventListener("click", openModal)
    closeModalButton?.addEventListener("click", closeModal)
    refreshFeedButton?.addEventListener("click", refreshFeed)

    feedModeElement?.addEventListener("change", () => {
        state.mode = feedModeElement.value
        refreshFeed()
    })

    feedCategoryElement?.addEventListener("change", () => {
        state.feedCategoryId = feedCategoryElement.value || null
        refreshFeed()
    })

    postFormElement?.addEventListener("submit", async (event) => {
        event.preventDefault()

        try {
            await handleCreatePost()
            closeModal()
            await refreshFeed()
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : "No se pudo crear el post",
            )
        }
    })
}

const populateCategorySelects = (categories) => {
    for (const select of [feedCategoryElement, postCategoryElement]) {
        if (!select) continue
        const placeholder = select === feedCategoryElement ? "Todas" : "Ninguna"
        select.innerHTML = `<option value="">${placeholder}</option>`
        categories.forEach((cat) => {
            const opt = document.createElement("option")
            opt.value = String(cat.id)
            opt.textContent = cat.name
            select.appendChild(opt)
        })
    }
}

const loadCategories = async () => {
    try {
        const response = await fetch("/api/categories")
        const cats = await response.json()
        state.categories = Array.isArray(cats) ? cats : []
        populateCategorySelects(state.categories)
    } catch {
        // silently ignore
    }
}

loadCategories()
bindEvents()
refreshFeed()

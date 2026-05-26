const API = "/api/admin/prohibited-words"

const wordListElement = document.querySelector("#word-list")
const addWordForm = document.querySelector("#add-word-form")
const wordInput = document.querySelector("#word-input")
const categoryInput = document.querySelector("#category-input")

const renderWords = (words) => {
    if (!wordListElement) return

    if (words.length === 0) {
        wordListElement.innerHTML =
            '<p class="px-4 py-6 text-center text-sm text-zinc-500">No hay palabras configuradas.</p>'
        return
    }

    wordListElement.innerHTML = ""
    words.forEach((word) => {
        const row = document.createElement("div")
        row.className = "flex items-center justify-between px-4 py-3"

        const info = document.createElement("div")
        info.className = "flex items-center gap-3"

        const wordSpan = document.createElement("span")
        wordSpan.className = "font-mono text-sm text-zinc-900"
        wordSpan.textContent = word.word

        const badge = document.createElement("span")
        badge.className =
            "rounded bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600"
        badge.textContent = word.category

        info.appendChild(wordSpan)
        info.appendChild(badge)

        const deleteBtn = document.createElement("button")
        deleteBtn.className =
            "rounded border border-red-300 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
        deleteBtn.textContent = "Eliminar"
        deleteBtn.addEventListener("click", async () => {
            try {
                const res = await fetch(`${API}/${word.id}`, {
                    method: "DELETE",
                })
                if (!res.ok) throw new Error("Error al eliminar")
                loadWords()
            } catch (err) {
                alert(err.message)
            }
        })

        row.appendChild(info)
        row.appendChild(deleteBtn)
        wordListElement.appendChild(row)
    })
}

const loadWords = async () => {
    try {
        const res = await fetch(API)
        const data = await res.json()
        renderWords(Array.isArray(data) ? data : [])
    } catch {
        renderWords([])
    }
}

addWordForm?.addEventListener("submit", async (event) => {
    event.preventDefault()
    const word = wordInput?.value.trim()
    const category = categoryInput?.value
    if (!word) return

    try {
        const res = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ word, category }),
        })
        if (!res.ok) throw new Error("Error al agregar")
        wordInput.value = ""
        loadWords()
    } catch (err) {
        alert(err.message)
    }
})

loadWords()

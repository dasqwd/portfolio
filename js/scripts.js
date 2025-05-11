const config = {
  token: "pat_x8X38MRHfPsV01gD6aHnlJBS379WjiQRe21suebBgKdwktJVPpP1qjTuRR0NFXu4",
  botId: "7502391040024920114",
  avatars: {
    user: "./images/user-avatar.png",
    assistant: "./images/ai-avatar.png"
  },
  fallbackAvatar: "./images/default-icon.png"
};

// DOM 引用
const userInput = document.getElementById("user-input");
const sendBtn   = document.getElementById("send-btn");
const messagesContainer = document.getElementById("messages");
const loadingIndicator  = document.querySelector(".loading-indicator");

let conversationId = null;  // 用于多轮对话上下文

// 监听
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

async function sendMessage() {
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  appendMessage(userMessage, "user");
  userInput.value = "";

  userInput.disabled = true;
  sendBtn.disabled   = true;
  loadingIndicator.style.opacity = "1";

  try {
    const payload = {
      bot_id: config.botId,
      user:   "user_123456",
      query:  userMessage
    };
    if (conversationId) {
      payload.conversation_id = conversationId;
    }

    const response = await fetch("https://api.coze.cn/open_api/v2/chat", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${config.token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`网络错误：${response.status}`);
    }

    const result = await response.json();
    console.log("Coze 返回（顶层）：", result);

    if (result.code !== 0) {
      throw new Error(`API 错误：${result.msg || result.code}`);
    }

    // —— 从顶层读取会话 ID —— 
    const newConvId = result.conversation_id;
    if (newConvId) {
      conversationId = newConvId;
      console.log("更新 conversationId 为：", conversationId);
    }

    // —— 从顶层 messages 数组选取回答 —— 
    const msgs = result.messages || [];
    let answerMsg = msgs.find(m => m.type === "answer");
    if (!answerMsg) answerMsg = msgs.find(m => m.type === "verbose");
    if (!answerMsg && msgs.length) answerMsg = msgs[msgs.length - 1];
    const reply = answerMsg?.content ?? "（AI 未返回内容）";

    appendMessage(reply, "assistant");

  } catch (err) {
    console.error("请求出错：", err);
    appendMessage("发生错误，请稍后再试。", "assistant");
  } finally {
    userInput.disabled = false;
    sendBtn.disabled   = false;
    loadingIndicator.style.opacity = "0";
  }
}

function appendMessage(content, type) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type} animate__animated animate__fadeInUp`;

  const avatar = document.createElement("img");
  avatar.className = "avatar";
  avatar.src = config.avatars[type] || config.fallbackAvatar;
  avatar.onerror = () => { avatar.src = config.fallbackAvatar; };

  const text = document.createElement("div");
  text.className = "message-text";
  text.textContent = content;

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(text);
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

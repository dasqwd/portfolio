const config = {
  token: "pat_x8X38MRHfPsV01gD6aHnlJBS379WjiQRe21suebBgKdwktJVPpP1qjTuRR0NFXu4", // ⚠ 建议移到后端
  assistantId: "asst_F3EEC61eLoNBYCJkwoohZtHV",
  avatars: {
    user: "./images/user-avatar.png",
    assistant: "./images/ai-avatar.png"
  },
  fallbackAvatar: "./images/user-avatar.png"
};

// 获取 DOM 元素
const userInput = document.getElementById("user-input");
const chatMessages = document.getElementById("chat-messages");
const sendBtn = document.getElementById("send-btn");
const messagesContainer = document.getElementById("messages");
const loadingIndicator = document.querySelector(".loading-indicator");

let threadId = null;

// 监听按钮点击
sendBtn.addEventListener("click", sendMessage);

// 监听回车发送
userInput.addEventListener("keydown", function (e) {
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

  // 禁用输入与显示loading
  userInput.disabled = true;
  sendBtn.disabled = true;
  loadingIndicator.style.opacity = "1";

  try {
    // 1. 创建对话线程
    if (!threadId) {
      const threadRes = await fetch("https://api.openai.com/v1/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${config.token}`
        }
      });
      const threadData = await threadRes.json();
      threadId = threadData.id;
    }

    // 2. 添加用户消息
    await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.token}`
      },
      body: JSON.stringify({
        role: "user",
        content: userMessage
      })
    });

    // 3. 触发运行
    const runRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.token}`
      },
      body: JSON.stringify({
        assistant_id: config.assistantId
      })
    });
    const runData = await runRes.json();

    // 4. 轮询获取回复
    const assistantReply = await pollRunStatus(threadId, runData.id);

    if (assistantReply) {
      appendMessage(assistantReply, "assistant");
    } else {
      appendMessage("Assistant did not reply in time.", "assistant");
    }

  } catch (error) {
    console.error("Error:", error);
    appendMessage("发生错误，请稍后再试。", "assistant");
  } finally {
    // 恢复输入与隐藏loading
    userInput.disabled = false;
    sendBtn.disabled = false;
    loadingIndicator.style.opacity = "0";
  }
}

// 轮询获取助手回复
async function pollRunStatus(threadId, runId) {
  const maxAttempts = 20;
  const delay = 1500;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
      headers: {
        "Authorization": `Bearer ${config.token}`
      }
    });
    const data = await res.json();

    if (data.status === "completed") {
      // 获取消息
      const msgRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        headers: {
          "Authorization": `Bearer ${config.token}`
        }
      });
      const msgData = await msgRes.json();
      const lastMsg = msgData.data.find(msg => msg.role === "assistant");
      return lastMsg?.content?.[0]?.text?.value || "（无内容）";
    }

    await new Promise(resolve => setTimeout(resolve, delay));
  }

  return null;
}

// 显示消息
function appendMessage(content, type) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type} animate__animated animate__fadeInUp`;

  const avatar = document.createElement("img");
  avatar.className = "avatar";
  avatar.src = config.avatars[type] || config.fallbackAvatar;

  const text = document.createElement("div");
  text.className = "message-text";
  text.textContent = content;

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(text);
  messagesContainer.appendChild(messageDiv);

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

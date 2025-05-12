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

const starterQuestionPool = [
  "简单介绍一下李鹏程的工作经历",
  "李鹏程对AI方向的理解或兴趣是什么",
  "可以帮我快速了解他的代表项目吗？",
  "他是否有实际商业化落地经验？",
  "有哪些独立开发或个人项目？",
  "请问李鹏程的技术栈是什么？",
  "他的AI项目是否支持产品化上线",
  "能介绍一下李鹏程做的AI合成游戏吗",
  "李鹏程现在在找什么方向的工作？偏AI还是游戏",
  "他对职位有什么偏好或发展目标",
  "他合作方式或沟通风格怎么样？",
  "他在项目中擅长解决哪一类问题",
  "他是偏技术、偏产品，还是偏创意型人才",
  "如何理解AI和实际应用",
  "李鹏程如何看待AI和游戏的结合",
  "他平时如何学习和提升技能的",
  "他如何理解产品经理工作流程",
  "他如何理解产品经理和游戏策划的区别",
  "你用过哪些大模型",
  "未来三年的职业规划是什么",
  "如何构建结构化知识库",
  "你是如何去做产品分析和市场定位",
  "你有哪些技术背景支撑落地AI产品",
  "为什么想转做AI方向"
];

let currentQuestions = [];

function getRandomQuestion(excludeList) {
  const pool = starterQuestionPool.filter(q => !excludeList.includes(q));
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function renderStarterBar() {
  const container = document.getElementById("starter-questions-bar");
  container.innerHTML = "";

  currentQuestions.forEach((question, index) => {
    const btn = document.createElement("button");
    btn.className = "starter-question-btn";
    btn.textContent = question;

    btn.addEventListener("click", () => {
      // 模拟用户点击后提问
      userInput.value = question;
      sendMessage();

      // 替换掉当前的问题
      const usedQuestion = currentQuestions[index];
      const newQuestion = getRandomQuestion(currentQuestions);

      if (newQuestion) {
        currentQuestions[index] = newQuestion;
      } else {
        currentQuestions.splice(index, 1); // 没有新问题了，删掉
      }

      renderStarterBar(); // 重新渲染
    });

    container.appendChild(btn);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // 初始化3个不重复的问题
  const shuffled = starterQuestionPool.sort(() => Math.random() - 0.5);
  currentQuestions = shuffled.slice(0, 3);
  renderStarterBar();
});

function useStarter(text) {
  userInput.value = text;
  sendMessage();
}

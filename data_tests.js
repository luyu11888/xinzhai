/* ============================================================
 * 心斋 · 测评题库（照一照）
 * 结构分两类：
 *   A. 标准量表（kind 缺省 = 单维总分）：采用流传的官方英文原题 + 中文对照，
 *      并按通行计分/分档给出解读（仅供参考，不作诊断）。
 *   B. 原创自省（self:true）：中医 / 佛家视角的观照小测，非量表。
 * 字段：id/src/name/sub/base/questions/ranges 或 kind:'multi'+build。
 *   src：west=现代心理 / tcm=中医心理 / bud=佛家心法
 *   q.en：官方原题英文（渲染为中文题面下方的小注）
 *   multi 测验：每题可带 dim 或选项带 d，build(qSels, it) 返回
 *     { badge, color, title, note, sug }，note 支持多行。
 * ============================================================ */

/* ---- 共用选项组（避免重复） ---- */
/* 近两周频率 0-3（PHQ-9 / GAD-7） */
var OPT_W2 = [
  { t: '完全没有', s: 0 },
  { t: '有几天', s: 1 },
  { t: '一半以上天数', s: 2 },
  { t: '几乎每天', s: 3 }
];
/* 近一月频率 0-4（PSS-10） */
var OPT_M4 = [
  { t: '从不', s: 0 },
  { t: '很少', s: 1 },
  { t: '有时', s: 2 },
  { t: '常常', s: 3 },
  { t: '总是', s: 4 }
];
/* 困难程度 0-3（AIS-8） */
var OPT_AIS = [
  { t: '几乎没有困难', s: 0 },
  { t: '轻度困难', s: 1 },
  { t: '中度困难', s: 2 },
  { t: '重度困难', s: 3 }
];
/* 孤独频率 1-4（UCLA-3） */
var OPT_U3 = [
  { t: '从不', s: 1 },
  { t: '很少', s: 2 },
  { t: '有时', s: 3 },
  { t: '常常', s: 4 }
];
/* 自尊 1-4（RSES） */
var OPT_R4 = [
  { t: '很不同意', s: 1 },
  { t: '不同意', s: 2 },
  { t: '同意', s: 3 },
  { t: '很同意', s: 4 }
];
var OPT_R4R = [
  { t: '很不同意', s: 4 },
  { t: '不同意', s: 3 },
  { t: '同意', s: 2 },
  { t: '很同意', s: 1 }
];
/* 正念 1-6（MAAS） */
var OPT_M6 = [
  { t: '几乎总是', s: 1 },
  { t: '非常经常', s: 2 },
  { t: '有些经常', s: 3 },
  { t: '有些少', s: 4 },
  { t: '非常少', s: 5 },
  { t: '几乎从不', s: 6 }
];
/* 依恋 / 大五 1-5~1-7 同意度 */
function optAgree(n) {
  var out = [], base = n === 7
    ? ['完全不同意', '不同意', '有点不同意', '中立', '有点同意', '同意', '完全同意']
    : ['很不同意', '不同意', '不好说', '同意', '很同意'];
  for (var i = 0; i < base.length; i++) out.push({ t: base[i], s: i + 1 });
  return out;
}
var OPT_A7 = optAgree(7); /* ECR */
var OPT_A5 = optAgree(5); /* BFI-10 */

var TESTS = [
/* ═══════════════════ 情绪三件套 · 标准量表 ═══════════════════ */
{
  id: 'phq9', src: 'west', name: '情绪低落 · PHQ-9',
  sub: '过去两周，下面这些情形有多少天困扰你？',
  base: 'Patient Health Questionnaire-9（Kroenke & Spitzer, 2001）原版计分与分档',
  questions: [
    { q: '做事提不起劲或没有乐趣。', en: 'Little interest or pleasure in doing things.', opts: OPT_W2 },
    { q: '心情低落、抑郁或觉得没有希望。', en: 'Feeling down, depressed, or hopeless.', opts: OPT_W2 },
    { q: '入睡困难、睡不安稳，或睡得太多。', en: 'Trouble falling or staying asleep, or sleeping too much.', opts: OPT_W2 },
    { q: '感觉疲倦，或没有力气。', en: 'Feeling tired or having little energy.', opts: OPT_W2 },
    { q: '胃口差，或吃得太多。', en: 'Poor appetite or overeating.', opts: OPT_W2 },
    { q: '觉得自己很糟，或觉得自己是失败者、让家人失望了。', en: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down.', opts: OPT_W2 },
    { q: '做事难以专心，例如看报、看电视也走神。', en: 'Trouble concentrating on things, such as reading the newspaper or watching television.', opts: OPT_W2 },
    { q: '动作或说话慢到别人能察觉；或者相反——烦躁、坐不住，动得比平常多很多。', en: 'Moving or speaking so slowly that other people could have noticed. Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual.', opts: OPT_W2 },
    { q: '有“不如死了算了”或“伤害自己”的念头。', en: 'Thoughts that you would be better off dead, or of hurting yourself in some way.', opts: OPT_W2 }
  ],
  ranges: [
    { to: 4, badge: '基 本 无 碍', title: '低落的痕迹很轻', color: '#4f6f47',
      note: '总分 0–4：近两周几乎没有持续的低落症状。偶有没劲、烦躁属正常波动，不构成困扰。',
      sug: '保持规律作息与运动，低落多半不来找你；若哪天情绪持续下坡，再来照一照不迟。' },
    { to: 9, badge: '轻 度 低 落', title: '轻度：别急着给自己下定义', color: '#8a6a2e',
      note: '总分 5–9：轻度抑郁症状范围。你可能开始对事提不起劲、睡与胃口有变化，但大多还能撑住日常。',
      sug: '①每天晒 20 分钟太阳、出门走一走（光照直接作用于情绪）；②把“我完了”的念头写下来，换成“我最近很难，但我还能做点什么”；③两周后若分数没降，建议与咨询师聊聊。' },
    { to: 14, badge: '中 度 低 落', title: '中度：这段日子需要被认真对待', color: '#b98e4e',
      note: '总分 10–14：中度。低落已经占去近两周多半时间，兴趣、睡眠、体力都在被拖走——这不是“想开点”能解决的状态，是情绪需要被照顾的信号。',
      sug: '建议预约心理咨询或精神心理科做正规评估（PHQ-9 只是筛查，不替代面诊）。同时把大目标砍到最小：每天只做一件“做完即算赢”的小事，并告诉一位信得过的亲友你的真实状态。' },
    { to: 19, badge: '中 重 度', title: '中重度：请把“求助”排进日程', color: '#a0392a',
      note: '总分 15–19：中重度。你多半时间泡在低潮里，自我否定明显，甚至开始怀疑一切努力的意义。请知道：这是症状在说话，不是你的真相。',
      sug: '请近期（一周内）安排一次正规面诊（三甲医院精神心理科/靠谱咨询机构），并请一位亲友陪你走这段。每晚睡前做“感恩三件事”，哪怕只是“今天按时吃了饭”，先把微光攒回来。' },
    { to: 27, badge: '较 重 · 请 求助', title: '你辛苦了，现在就把手伸出来', color: '#a0392a',
      note: '总分 20–27：重度。若你正反复出现“不如死了算了”的念头，请立即行动：告诉身边的人，或拨打心理援助热线（全国统一心理援助热线 12356，24 小时）；这不是软弱，是求生。',
      sug: '①现在就把本页发给一位你信任的人，请 TA 陪你；②尽快就医（药物与心理治疗对中重度抑郁都明确有效）；③你不需要一次好起来，只需要迈出求助这一步。路再暗，有人在，就有光。' }
  ]
},
{
  id: 'gad7', src: 'west', name: '焦虑不安 · GAD-7',
  sub: '过去两周，紧张、担忧、坐不住有多常出现？',
  base: 'Generalized Anxiety Disorder-7（Spitzer et al., 2006）原版计分与分档',
  questions: [
    { q: '感到紧张、焦虑或坐立不安。', en: 'Feeling nervous, anxious, or on edge.', opts: OPT_W2 },
    { q: '无法停止或控制担忧。', en: 'Not being able to stop or control worrying.', opts: OPT_W2 },
    { q: '对各种事情担忧过多。', en: 'Worrying too much about different things.', opts: OPT_W2 },
    { q: '很难放松下来。', en: 'Trouble relaxing.', opts: OPT_W2 },
    { q: '烦躁不安，以至于很难安坐。', en: 'Being so restless that it is hard to sit still.', opts: OPT_W2 },
    { q: '变得容易烦恼或易怒。', en: 'Becoming easily annoyed or irritable.', opts: OPT_W2 },
    { q: '感到害怕，好像有什么可怕的事会发生。', en: 'Feeling afraid, as if something awful might happen.', opts: OPT_W2 }
  ],
  ranges: [
    { to: 4, badge: '心 绪 平 稳', title: '焦虑只是偶尔路过', color: '#4f6f47',
      note: '总分 0–4：近两周焦虑水平很低。紧张、担心都是偶发，身体能自行回稳。',
      sug: '把“会休息”当成习惯存起来：每天留十分钟不赶时间的小事（散步、泡茶、发呆都算）。' },
    { to: 9, badge: '轻 度 焦 虑', title: '轻度：紧绷有信号，不用慌', color: '#8a6a2e',
      note: '总分 5–9：轻度焦虑。你可能常觉得心里绷着、担忧刹不住，但大体还能工作生活。',
      sug: '三招白话版：①把担忧写下来，只留“今天能做的第一步”；②每天两次“4-7-8 呼吸”（吸 4 秒·屏 7 秒·呼 8 秒），专治紧绷；③睡前一小时不碰刺激内容。' },
    { to: 14, badge: '中 度 焦 虑', title: '中度：神经的黄灯亮太久了', color: '#b98e4e',
      note: '总分 10–14：中度。紧张、担心、睡不踏实已成常态，身体也在替你喊累（肩颈紧、心慌、易怒）。焦虑不是“想太多”的错，是长期负荷下神经系统的警觉模式。',
      sug: '建议做一次正规评估（医院/机构的 GAD-7 纸质测评或咨询面谈）。同时每天做“身体接地”：脚踩地面、深呼吸，把注意力放回手脚的触感——把心从“万一”拉回现在。' },
    { to: 21, badge: '较 重 焦 虑', title: '你的神经辛苦了，该求助了', color: '#a0392a',
      note: '总分 15–21：重度焦虑。神经几乎一直紧绷，睡眠、专注、情绪都在被透支——这已经是需要专业介入的状态，不是性格问题。',
      sug: '请尽快安排正规评估与干预：认知行为疗法、放松训练与必要的药物都能有效松绑。别自己硬扛；紧绷是状态不是性格，状态就能调。' }
  ]
},
{
  id: 'pss10', src: 'west', name: '压力感知 · PSS-10',
  sub: '过去一个月，你感到“事情撑不住”的频率？',
  base: 'Perceived Stress Scale-10（Cohen, Kamarck & Mermelstein, 1983）原版计分',
  questions: [
    { q: '因为一些意外发生的事情而感到心烦意乱。', en: '…been upset because of something that happened unexpectedly?', opts: OPT_M4 },
    { q: '感到无法掌控生活中重要的事情。', en: '…felt that you were unable to control the important things in your life?', opts: OPT_M4 },
    { q: '感到紧张不安和“压力山大”。', en: '…felt nervous and "stressed"?', opts: OPT_M4 },
    { q: '对自己处理个人问题的能力有信心。', en: '…felt confident about your ability to handle your personal problems?', opts: [ { t: '从不', s: 4 }, { t: '很少', s: 3 }, { t: '有时', s: 2 }, { t: '常常', s: 1 }, { t: '总是', s: 0 } ] },
    { q: '感到事情都在顺着自己的意思发展。', en: '…felt that things were going your way?', opts: [ { t: '从不', s: 4 }, { t: '很少', s: 3 }, { t: '有时', s: 2 }, { t: '常常', s: 1 }, { t: '总是', s: 0 } ] },
    { q: '发现自己无法应付所有必须做的事。', en: '…found that you could not cope with all the things that you had to do?', opts: OPT_M4 },
    { q: '能够掌控生活中的恼人小事。', en: '…been able to control irritations in your life?', opts: [ { t: '从不', s: 4 }, { t: '很少', s: 3 }, { t: '有时', s: 2 }, { t: '常常', s: 1 }, { t: '总是', s: 0 } ] },
    { q: '感到自己把事情都处理得很好。', en: '…felt that you were on top of things?', opts: [ { t: '从不', s: 4 }, { t: '很少', s: 3 }, { t: '有时', s: 2 }, { t: '常常', s: 1 }, { t: '总是', s: 0 } ] },
    { q: '因为一些自己无法控制的事情而生气。', en: '…been angered because of things that were outside of your control?', opts: OPT_M4 },
    { q: '感到困难堆积如山，自己无法克服。', en: '…felt difficulties were piling up so high that you could not overcome them?', opts: OPT_M4 }
  ],
  ranges: [
    { to: 13, badge: '压 力 较 轻', title: '你的承受力还挺从容', color: '#4f6f47',
      note: '总分 0–13（人群参照偏低段）：过去一个月你大多能兜住日常波动，觉得事情基本在掌控中。',
      sug: '别忘了“预防式休息”：不要等见底才充电。每天留一段不产出的时间，是你的护城河。' },
    { to: 26, badge: '压 力 中 等', title: '中等：能扛，但已经在耗电', color: '#b98e4e',
      note: '总分 14–26（人群参照中段）：你常有“事情堆成山、撑着走”的感受，掌控感下降、易被小事惹毛。压力本身不是病，长期不卸才是。',
      sug: '①做减法：分清“该我扛的”与“习惯性揽的”，把后者松手；②每天 20 分钟“无目的时间”（散步、听歌、发呆）且不许内疚；③把大委屈写成纸条，只给信任的人看。' },
    { to: 40, badge: '压 力 较 大', title: '你的蓄电池报警了，先停一下', color: '#a0392a',
      note: '总分 27–40（人群参照偏高段）：过去一个月你多半觉得失控、撑不住、一触即炸。长期高压已接近耗竭，请把“减负”排在第一位。',
      sug: '建议暂停/削减负荷源头（必要时请假休息），寻求心理咨询中的压力与倦怠辅导。同时做最小恢复动作：每天散步晒太阳、好好吃一顿热饭、睡前把待办写到纸上再睡。你需要的不是“再撑一撑”，是“先停下来”。' }
  ]
},
/* ═══════════════════ 睡眠专项 · 标准量表 ═══════════════════ */
{
  id: 'ais8', src: 'west', name: '失眠自检 · AIS-8',
  sub: '过去一个月（若你只睡了几晚，就按“近期通常”回答）',
  base: 'Athens Insomnia Scale（Soldatos et al., 2000）原版计分与切分（≥6 提示失眠）',
  questions: [
    { q: '入睡：熄灯后，要多久才能睡着？', en: 'Sleep induction (time it takes you to fall asleep after turning off the lights).', opts: OPT_AIS },
    { q: '夜间醒来：夜里醒来的次数多吗？', en: 'Awakenings during the night.', opts: OPT_AIS },
    { q: '早醒：是不是总比期望的时间早醒？', en: 'Final wakening earlier than desired.', opts: OPT_AIS },
    { q: '总睡眠时间：加起来够不够你恢复精力？', en: 'Total sleep duration.', opts: OPT_AIS },
    { q: '整体睡眠质量：你对自己这段时间的睡眠满意吗？', en: 'Sleep quality overall.', opts: OPT_AIS },
    { q: '白天状态：醒来后白天是否感觉精力、心情不佳？', en: 'Sense of well-being during the day.', opts: OPT_AIS },
    { q: '白天机能：注意力、记忆、处理事务是否受影响？', en: 'Functioning (physical and mental) during the day.', opts: OPT_AIS },
    { q: '白天困倦：白天是否常常犯困、想打盹？', en: 'Sleepiness during the day.', opts: OPT_AIS }
  ],
  ranges: [
    { to: 3, badge: '睡 眠 达 标', title: '你的睡眠大体够用', color: '#4f6f47',
      note: '总分 0–3：未达失眠提示范围。入睡、夜醒、白天精力都基本在健康区间。',
      sug: '守住就赢了：固定上床与起床时间（周末别差太多），睡前一小时调暗灯光。好睡眠的人也要小心“熬一夜，三天来还”。' },
    { to: 5, badge: '临 界 状 态', title: '睡眠在临界点，别让它滑下去', color: '#b98e4e',
      note: '总分 4–5：亚临床失眠（边缘）。入睡变慢、夜醒变多或白天犯困，已经在你身上冒头，多半与睡前刷手机、脑子不关机有关。',
      sug: '①把卧室还给睡觉：不在床上刷手机、工作；②睡前 90 分钟调暗灯、少刷短视频；③躺下后若脑子放电影，就听呼吸数息，不强迫入睡——“越努力越睡不着”，放松反而容易睡着。若持续超一个月，看睡眠门诊。' },
    { to: 24, badge: '失 眠 提 示', title: '睡眠在报警，该正式处理了', color: '#a0392a',
      note: '总分 6–24：达到失眠筛查提示。入睡难、夜醒多、白天靠硬撑——长期缺觉会放大焦虑与低落，甚至让你误以为“性格变差了”，其实只是太困了。',
      sug: '请把睡眠当“治疗”来对待：①固定起床时间（哪怕前一晚没睡好），白天不补大觉；②躺下约 20 分钟睡不着就起来做点无聊事，困了再回床；③暂停咖啡因与酒精；④若与焦虑、低落相伴且超两周，请就医——失眠的认知行为疗法非常有效，不必硬扛。' }
  ]
},
/* ═══════════════════ 关系 · 标准量表 ═══════════════════ */
{
  id: 'ucla', src: 'west', name: '孤独感 · UCLA-3',
  sub: '下面三个问题，按你平时（尤其近两周）的真实感受作答',
  base: 'UCLA Loneliness Scale 短版（Russell, 1996；三题版与全量表高度相关）',
  questions: [
    { q: '你有多常感到缺少可以相伴的人？', en: 'How often do you feel that you lack companionship?', opts: OPT_U3 },
    { q: '你有多常感到被冷落、被排除在外？', en: 'How often do you feel left out?', opts: OPT_U3 },
    { q: '你有多常感到自己与别人是隔开的？', en: 'How often do you feel isolated from others?', opts: OPT_U3 }
  ],
  ranges: [
    { to: 5, badge: '联 结 尚 可', title: '你多半不觉得孤单', color: '#4f6f47',
      note: '总分 3–5：孤独感低。你有能说话的人，也觉得自己被世界连着。',
      sug: '关系像炉火，常添柴才不灭：主动约那个“聊得来的人”见一面，比点赞一百次都养心。' },
    { to: 12, badge: '孤 独 感 明 显', title: '你不是没人，是缺少“深连接”', color: '#a0392a',
      note: '总分 6–12：孤独感达到提示水平（三题版常用 ≥6 为界）。孤独的痛不在“没人”，而在心里那份“与人有隔”的感觉；长期孤独会悄悄拖低情绪与睡眠。',
      sug: '①把“找热闹”换成“建深度”：每周约 1 个能说真话的人，练一句示弱——“我最近其实挺需要有人聊聊”；②做一件“让我有用”的小事：去社区做义工、陪老人说说话——当你的心有了去处和用处，荒凉就淡了；③若孤独伴随长期低落，建议寻求咨询陪伴，孤独不是羞耻，是求救信号，接住它很勇敢。' }
  ]
},
{
  id: 'rses', src: 'west', name: '自尊水平 · RSES',
  sub: '下面是对自己的十句评价，请按此刻的真实想法作答',
  base: 'Rosenberg Self-Esteem Scale（Rosenberg, 1965）原版项目与计分',
  questions: [
    { q: '我觉得自己是个有价值的人，至少与别人不相上下。', en: 'I feel that I am a person of worth, at least on an equal plane with others.', opts: OPT_R4 },
    { q: '我觉得自己有不少好品质。', en: 'I feel that I have a number of good qualities.', opts: OPT_R4 },
    { q: '总而言之，我常常倾向于觉得自己是个失败者。', en: 'All in all, I am inclined to feel that I am a failure.', opts: OPT_R4R },
    { q: '我能把事情做得和大多数人一样好。', en: 'I am able to do things as well as most other people.', opts: OPT_R4 },
    { q: '我觉得自己没有什么值得骄傲的地方。', en: 'I feel I do not have much to be proud of.', opts: OPT_R4R },
    { q: '我对自己抱着积极的态度。', en: 'I take a positive attitude toward myself.', opts: OPT_R4 },
    { q: '总的来说，我对自己是满意的。', en: 'On the whole, I am satisfied with myself.', opts: OPT_R4 },
    { q: '我希望自己能更看得起自己一点。', en: 'I wish I could have more respect for myself.', opts: OPT_R4R },
    { q: '我有时确实觉得自己很没用。', en: 'I certainly feel useless at times.', opts: OPT_R4R },
    { q: '有时候我觉得自己一无是处。', en: 'At times I think I am no good at all.', opts: OPT_R4R }
  ],
  ranges: [
    { to: 19, badge: '自 尊 偏 低', title: '你对自己的评价比事实更苛刻', color: '#a0392a',
      note: '总分 10–19（参照分档偏低段）：你习惯性看低自己——“我不配、我不行、我不好”常自动冒出。这多半不是你不行，而是长期被比较、被苛责后长出的“自我滤镜”。',
      sug: '①开始“自我对账”：每晚写一条“我今天做成/做对的一件事”，小到按时吃饭都算；②把骂自己的话，换成你会对好朋友说的话；③若低自尊伴随长期情绪低落，建议咨询师陪你拆“我是谁”的旧账——自尊是可以重新长出来的。' },
    { to: 29, badge: '自 尊 中 等', title: '你大体肯定自己，但会摇晃', color: '#b98e4e',
      note: '总分 20–29（参照中段）：你多数时候认可自己，但评价容易随外界波动——被夸就高、被批就低，根不稳。',
      sug: '把“自我价值”的锚从别人手里拿回来：每周记一件“我不靠别人认可也成立”的事实（我帮了人、我坚持了某件事）。慢慢你会明白：你的价值不需要每次由结果盖章。' },
    { to: 40, badge: '自 尊 较 高', title: '你心里有一杆稳秤', color: '#4f6f47',
      note: '总分 30–40（参照偏高段）：你比较能接纳自己，也知道自己的分量，不容易被一句评价晃倒。',
      sug: '这是很稳的底子。留意别把“高自尊”活成“不能输”：稳的人不怕认错，也更能真心为别人鼓掌——继续把这份稳带给身边不够稳的人。' }
  ]
},
{
  id: 'ecr12', src: 'west', name: '依恋风格 · ECR-12', kind: 'multi',
  sub: '在“亲密关系”里（伴侣/密友，回忆长期模式作答）',
  base: '参考 ECR（亲密关系经历量表）简版框架：依恋焦虑 + 依恋回避两维（自编中文，仅供自我参照）',
  questions: [
    { q: '我常担心最亲近的人并没有那么在乎我。', dim: 'anx', opts: OPT_A7 },
    { q: '我很需要对方反复确认“还在”，得不到回应就心慌。', dim: 'anx', opts: OPT_A7 },
    { q: '我总怕自己做得不够好，对方就会离开。', dim: 'anx', opts: OPT_A7 },
    { q: '对方稍一冷淡，我就忍不住想是不是自己做错了什么。', dim: 'anx', opts: OPT_A7 },
    { q: '我希望和对方很亲密，又怕靠太近会被嫌弃。', dim: 'anx', opts: OPT_A7 },
    { q: '分开时，我常担心对方会不会遇到更喜欢的人。', dim: 'anx', opts: OPT_A7 },
    { q: '我不习惯向对方敞开心，谈自己的感受让我不自在。', dim: 'avo', opts: OPT_A7 },
    { q: '对方想靠近我时，我会下意识地想躲开。', dim: 'avo', opts: OPT_A7 },
    { q: '难过的时候，我宁可自己扛，也不愿向对方求助。', dim: 'avo', opts: OPT_A7 },
    { q: '我很难真正地信任和依赖别人。', dim: 'avo', opts: OPT_A7 },
    { q: '靠得太近会让我不安，我需要自己的空间才能喘气。', dim: 'avo', opts: OPT_A7 },
    { q: '我不喜欢让对方看到我的脆弱。', dim: 'avo', opts: OPT_A7 }
  ],
  build: function (sel) {
    var ax = 0, av = 0, n = 0;
    for (var i = 0; i < sel.length; i++) {
      if (sel[i].d === 'avo') { av += sel[i].s; n++; }
      else { ax += sel[i].s; n++; }
    }
    var mAnx = Math.round(ax / 6 * 10) / 10;
    var mAvo = Math.round(av / 6 * 10) / 10;
    var hiA = mAnx >= 4, hiV = mAvo >= 4, out;
    if (!hiA && !hiV) {
      out = { badge: '安 全 型', title: '安全型依恋：亲近与独立能两全', color: '#4f6f47',
        note: '依恋焦虑 ' + mAnx + ' 分（低）· 依恋回避 ' + mAvo + ' 分（低）。\n你能靠近对方而不怕被吞没，也能独立而不怕被抛弃：需要时有勇气求助，对方需要时也接得住——这是最“养人”的关系底盘。',
        sug: '把这份安全感用出去：在对方脆弱时多稳稳接住，在争执时先停一拍再开口。安全是可以“传染”给身边人的。' };
    } else if (hiA && !hiV) {
      out = { badge: '焦 虑 型', title: '焦虑型依恋：靠得越近，越怕失去', color: '#b98e4e',
        note: '依恋焦虑 ' + mAnx + ' 分（高）· 依恋回避 ' + mAvo + ' 分（低）。\n你非常在乎关系，却也常常患得患失：对方一冷你就慌，总要确认“还在”，越怕失去越抓得紧——你内在那个“怕被丢下的小孩”还在敲门。',
        sug: '①把“他怎么了”换成“我现在需要什么”：慌的时候先做几次深呼吸，问自己此刻是事实还是担心；②练习“自我安抚”：被冷落时先照顾自己，而不是立刻讨回应；③和伴侣约定一句安全暗号（如“我不是离开你，只是需要缓一缓”），给彼此台阶。焦虑不是错，是你太在乎——把在乎变成温柔的表达，而不是捆绑。' };
    } else if (!hiA && hiV) {
      out = { badge: '回 避 型', title: '回避型依恋：你不是不需要，是不敢需要', color: '#46607a',
        note: '依恋焦虑 ' + mAnx + ' 分（低）· 依恋回避 ' + mAvo + ' 分（高）。\n你习惯自己扛、怕被依赖、靠太近就想逃。表面潇洒独立，心里却常有一块“说不出口的孤独”——回避是在保护那个受过伤、怕再被辜负的自己。',
        sug: '①承认“我也需要人”，是强大不是软弱：从小处开始，试着把一件小事（今天很累/这个我不会）告诉对方；②对方靠近时别立刻转身，练习“停留三秒”再决定躲不躲；③关系里你常占“先走开”的位置——下次吵架后，试试做先回头的那个人。安全感不是天生的，是练出来的。' };
    } else {
      out = { badge: '恐 惧 型', title: '恐惧型依恋：既渴望亲密，又怕受伤害', color: '#a0392a',
        note: '依恋焦虑 ' + mAnx + ' 分（高）· 依恋回避 ' + mAvo + ' 分（高）。\n你处在一种很拧巴的状态：心里渴望靠近，行动却在推开；对方近了你不安，远了你又慌。这多半是早年关系留下的“拉锯”模式——既想要爱，又认定爱会伤人。',
        sug: '这种模式最难独自解套，也最值得专业陪伴：建议与咨询师一起梳理你的“关系剧本”从何而来。日常先做两件事：①观察自己的“切换点”——是哪种情形让你从想靠近变成想逃，记下来；②对自己说“我可以既需要人，又保护自己”，二者不矛盾。别急着怪自己反复，模式看清了，就松动了一半。' };
    }
    out.sug = (out.sug || '') + '\n（ECR-12 为自评参照，不作诊断；想深入了解可找咨询师面谈。）';
    return out;
  }
},
/* ═══════════════════ 正念 · 标准量表 ═══════════════════ */
{
  id: 'maas15', src: 'west', name: '正念觉知 · MAAS',
  sub: '下面是一天里可能出现的“心不在场”时刻，选最贴近的频率',
  base: 'Mindful Attention Awareness Scale（Brown & Ryan, 2003）原版 15 题计分（均分越高，正念越足）',
  questions: [
    { q: '我可能正体验着某种情绪，却要过一会儿才意识到。', en: 'I could be experiencing some emotion and not be conscious of it until some time later.', opts: OPT_M6 },
    { q: '我会因为粗心、走神或想着别的事而打翻东西、弄坏东西。', en: 'I break or spill things because of carelessness, not paying attention, or thinking of something else.', opts: OPT_M6 },
    { q: '我很难把注意力放在当下正在发生的事上。', en: 'I find it difficult to stay focused on what’s happening in the present.', opts: OPT_M6 },
    { q: '我常走得很快，只想快点到，没留意沿途经历了什么。', en: 'I tend to walk quickly to get where I’m going without paying attention to what I experience along the way.', opts: OPT_M6 },
    { q: '身体发紧或不舒服，我往往要等它很明显了才注意到。', en: 'I tend not to notice feelings of physical tension or discomfort until they really grab my attention.', opts: OPT_M6 },
    { q: '别人刚告诉我名字，我转头就忘了。', en: 'I forget a person’s name almost as soon as I’ve been told it for the first time.', opts: OPT_M6 },
    { q: '我像是“自动模式”在做事，不太清楚自己正在做什么。', en: 'It seems I am “running on automatic,” without much awareness of what I’m doing.', opts: OPT_M6 },
    { q: '我做事情很赶，没有真正投入地做。', en: 'I rush through activities without being really attentive to them.', opts: OPT_M6 },
    { q: '我太专注目标本身，反而顾不上“此刻正在做的这一步”。', en: 'I get so focused on the goal I want to achieve that I lose touch with what I’m doing right now to get there.', opts: OPT_M6 },
    { q: '我机械地做家务或工作，没意识到自己在做什么。', en: 'I do jobs or tasks automatically, without being aware of what I’m doing.', opts: OPT_M6 },
    { q: '我常“一只耳朵听人说话”，同时做着别的事。', en: 'I find myself listening to someone with one ear, doing something else at the same time.', opts: OPT_M6 },
    { q: '我开车或走路到某处，到后才纳闷自己怎么来的。', en: 'I drive places on “automatic pilot” and then wonder why I went there.', opts: OPT_M6 },
    { q: '我发现自己总惦记着过去或未来。', en: 'I find myself preoccupied with the future or the past.', opts: OPT_M6 },
    { q: '我常常在没注意的情况下做着手里的事。', en: 'I find myself doing things without paying attention.', opts: OPT_M6 },
    { q: '我会无意识地吃零食，吃完才发觉。', en: 'I snack without being aware that I’m eating.', opts: OPT_M6 }
  ],
  ranges: [
    { to: 44, badge: '心 常 走 神', title: '你多半活在“自动模式”里', color: '#b98e4e',
      note: '均分低于 3：多数时刻你“人在心不在”——吃饭不知味、走路像快进、听人说话走神。这不怪你，现代生活就是一台“分心机器”，但心长期不在当下，会忙而空、累而虚。',
      sug: '从“三秒回家”开始：每天设 3 个闹钟，响铃时停三秒问“我此刻在做什么”，然后回到这件事上。再挑一件小事（喝水、走路、洗碗）全神贯注地做——觉察力像肌肉，每天练一会儿就长。' },
    { to: 59, badge: '中 等 觉 察', title: '你有时在当下，有时被念头带走', color: '#8a6a2e',
      note: '均分 3–4：你的觉察力中等。常能“回过神来”意识到自己走神——而能意识到走神，本身就是正念的开端。',
      sug: '把“意识到”变成“带回来”：每天 10 分钟静坐数息（吸气知进、呼气数数），念头跑了轻轻拉回。八周正念练习已被证实能缓解焦虑、提升专注，你缺的不是时间，是固定一个“回家”的练习。' },
    { to: 90, badge: '正 念 较 高', title: '你常能安住在当下', color: '#4f6f47',
      note: '均分高于 4：你有相当好的觉察底子——能尝到饭味、听到话尾、感觉到身体，心没有丢得太远。',
      sug: '这是很宝贵的资产。把它变成习惯：每天留几分钟“全神贯注地做一件小事”，并在情绪上来时先觉察身体（哪里紧、哪里热），再决定怎么回应——觉察是自由的第一步。' }
  ]
},
/* ═══════════════════ 人格 · 标准量表 ═══════════════════ */
{
  id: 'bfi10', src: 'west', name: '人格大五 · BFI-10', kind: 'multi',
  sub: '我把自己看作……（10 句，凭第一直觉选）',
  base: 'Big Five Inventory-10（Rammstedt & John, 2007）原版十题五维',
  questions: [
    { q: '……性格外向、善于社交的人。', en: 'is outgoing, sociable.', dim: 'E', opts: OPT_A5 },
    { q: '……对人总体信任、容易打交道的人。', en: 'is generally trusting.', dim: 'A', opts: OPT_A5 },
    { q: '……做事踏实、有始有终的人。', en: 'does a thorough job.', dim: 'C', opts: OPT_A5 },
    { q: '……放松、能较好应对压力的人。', en: 'is relaxed, handles stress well.', dim: 'N', rev: true, opts: OPT_A5 },
    { q: '……想象力丰富、点子多的人。', en: 'has an active imagination.', dim: 'O', opts: OPT_A5 },
    { q: '……比较拘谨、话少安静的人。', en: 'is reserved.', dim: 'E', rev: true, opts: OPT_A5 },
    { q: '……容易挑别人毛病的人。', en: 'tends to find fault with others.', dim: 'A', rev: true, opts: OPT_A5 },
    { q: '……有点懒散、容易拖的人。', en: 'tends to be lazy.', dim: 'C', rev: true, opts: OPT_A5 },
    { q: '……容易紧张、情绪起伏大的人。', en: 'gets nervous easily.', dim: 'N', opts: OPT_A5 },
    { q: '……对艺术、审美没多大兴趣的人。', en: 'has few artistic interests.', dim: 'O', rev: true, opts: OPT_A5 }
  ],
  build: function (sel, it) {
    var sum = { E: 0, A: 0, C: 0, N: 0, O: 0 }, cnt = { E: 0, A: 0, C: 0, N: 0, O: 0 }, i;
    for (i = 0; i < sel.length; i++) {
      var k = it.questions[i].dim, raw = sel[i].s;
      var eff = it.questions[i].rev ? (6 - raw) : raw;
      sum[k] += eff; cnt[k]++;
    }
    function m(k) { return Math.round(sum[k] / cnt[k] * 10) / 10; }
    function line(name, key, lo, hi, md) {
      var v = m(key);
      var d = v >= 3.5 ? hi : (v <= 2.5 ? lo : md);
      return name + '（' + v + '／5）' + d;
    }
    var note =
      line('外倾性 E', 'E', '偏内向：独处回血，想清楚才说，社交耗电。', '偏外向：从人群获得能量，说着说着就想明白了。', '居中：热闹与独处都能充电。') + '\n' +
      line('宜人性 A', 'A', '偏直率有主见：不假客气，遇不平会说。', '偏随和：好合作、顾大局，常在意外和气。', '居中：该让时让，该争时也争。') + '\n' +
      line('尽责性 C', 'C', '偏随性灵活：不喜欢被计划绑死，容易临时起意。', '偏自律有条理：答应的事会做完，喜欢计划感。', '居中：看事定，重要的事不掉链子。') + '\n' +
      line('情绪性 N', 'N', '心态稳、抗压好：情绪起伏小，遇事能淡定。', '感受力强也易内耗：想得多、容易紧张，心事重。', '居中：大多数时候稳，压力大了会绷。') + '\n' +
      line('开放性 O', 'O', '偏务实落地：看重经验与实用，不爱空想。', '偏开放好奇：爱联想、爱新可能，喜欢精神探索。', '居中：能落地也能发散。') +
      '\n\n（BFI-10 是 10 题简版，仅给粗略轮廓；五维没有好坏之分，只有你天生的“出厂设置”与后天的应对方式。）';
    return {
      badge: '大五 BFI-10', color: '#46607a', title: '你的五维人格轮廓',
      note: note,
      sug: '了解底色不是为了贴标签，而是知道：①“累”可能来自在用不适合自己的方式生活（内向的人硬撑社交局）；②挑 1 个最想调整的维度，给自己定一个 21 天小练习（如尽责偏低就从“每天只兑现一个小承诺”开始）。'
    };
  }
},
{
  id: 'mbti16', src: 'west', name: '性格 16 型 · MBTI', kind: 'multi',
  sub: '四个偏好（精力/信息/决策/生活），凭第一直觉选更接近的',
  base: '参考 Myers-Briggs Type Indicator 四维理论的自测题（题目为本站自编，非 MBTI 官方版本）',
  questions: [
    { q: '一群人的聚会之后，你通常更接近哪种状态？', opts: [ { t: '更来劲，还想继续聊（E）', s: 1, d: 'E' }, { t: '有点被掏空，想独处充电（I）', s: 1, d: 'I' } ] },
    { q: '认识新朋友时，你更容易：', opts: [ { t: '很快热络起来，主动找话题（E）', s: 1, d: 'E' }, { t: '需要一段时间观察，慢慢才熟（I）', s: 1, d: 'I' } ] },
    { q: '想问题的时候，你比较像：', opts: [ { t: '边想边说，说着说着才理清（E）', s: 1, d: 'E' }, { t: '先在心里想清楚，再开口（I）', s: 1, d: 'I' } ] },
    { q: '周末没事的时候，你更想：', opts: [ { t: '约人出去，人多才有意思（E）', s: 1, d: 'E' }, { t: '宅着做自己的事，自在最重要（I）', s: 1, d: 'I' } ] },
    { q: '看一件事时，你更先注意到：', opts: [ { t: '具体的事实、细节、步骤（S）', s: 1, d: 'S' }, { t: '背后的可能、联想与走向（N）', s: 1, d: 'N' } ] },
    { q: '你更相信：', opts: [ { t: '亲眼所见、亲身验证的东西（S）', s: 1, d: 'S' }, { t: '直觉与预感，哪怕说不清依据（N）', s: 1, d: 'N' } ] },
    { q: '做熟悉的事时，你更喜欢：', opts: [ { t: '按老办法、照步骤来，稳妥（S）', s: 1, d: 'S' }, { t: '换个新法子试试，哪怕冒险（N）', s: 1, d: 'N' } ] },
    { q: '朋友请你描述最近的事，你更爱讲：', opts: [ { t: '发生了什么、几点、谁在场（S）', s: 1, d: 'S' }, { t: '我的感受、联想、这件事像什么（N）', s: 1, d: 'N' } ] },
    { q: '跟人意见不合时，你更看重：', opts: [ { t: '把事情讲清楚、谁有理（T）', s: 1, d: 'T' }, { t: '别伤和气、对方感受如何（F）', s: 1, d: 'F' } ] },
    { q: '给人提意见时，你通常：', opts: [ { t: '直接指出问题，就事论事（T）', s: 1, d: 'T' }, { t: '先绕弯子照顾情绪，再委婉说（F）', s: 1, d: 'F' } ] },
    { q: '做决定时，你更容易被什么打动：', opts: [ { t: '逻辑与后果，公平不合理都不行（T）', s: 1, d: 'T' }, { t: '价值与人情，这个选择对谁更好（F）', s: 1, d: 'F' } ] },
    { q: '如果被评价，你更高兴听到：', opts: [ { t: '你逻辑清楚、判断很准（T）', s: 1, d: 'T' }, { t: '你真体贴、跟你在一起很舒服（F）', s: 1, d: 'F' } ] },
    { q: '安排行程时，你更像：', opts: [ { t: '提前列好计划，按表走（J）', s: 1, d: 'J' }, { t: '留足弹性，到时候看情况（P）', s: 1, d: 'P' } ] },
    { q: '手头有两件事时，你更常：', opts: [ { t: '做完一件再开始下一件（J）', s: 1, d: 'J' }, { t: '几件同时开着，看心情推进（P）', s: 1, d: 'P' } ] },
    { q: '截止日前一天，你通常：', opts: [ { t: '早就收尾，正从容检查（J）', s: 1, d: 'J' }, { t: '正在最后一刻赶工（P）', s: 1, d: 'P' } ] },
    { q: '你的桌面/房间通常是：', opts: [ { t: '收拾得整齐有秩序（J）', s: 1, d: 'J' }, { t: '乱中有序，我知道东西在哪（P）', s: 1, d: 'P' } ] }
  ],
  build: function (sel) {
    var c = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }, i;
    for (i = 0; i < sel.length; i++) { if (sel[i].d) c[sel[i].d]++; }
    function pick(a, b) { return c[a] >= c[b] ? a : b; }
    var code = pick('E', 'I') + pick('S', 'N') + pick('T', 'F') + pick('J', 'P');
    var nick = {
      INTJ: '建筑师型', INTP: '逻辑学家型', ENTJ: '指挥官型', ENTP: '辩论家型',
      INFJ: '提倡者型', INFP: '调停者型', ENFJ: '主人公型', ENFP: '竞选者型',
      ISTJ: '物流师型', ISFJ: '守护者型', ESTJ: '总经理型', ESFJ: '执政官型',
      ISTP: '鉴赏家型', ISFP: '探险家型', ESTP: '企业家型', ESFP: '表演者型'
    };
    var dict = {
      E: 'E 外向 · 精力从人群中来，说着说着就能想明白。', I: 'I 内向 · 精力靠独处回血，先想清楚再说。',
      S: 'S 实感 · 相信眼见为实，喜欢具体可操作。', N: 'N 直觉 · 看重可能与整体，不喜欢只抠细节。',
      T: 'T 思考 · 遇事先讲道理、分对错。', F: 'F 情感 · 遇事先看人、顾感受与价值。',
      J: 'J 判断 · 喜欢有定论、有计划、按时收尾。', P: 'P 知觉 · 喜欢保留弹性，随机应变更自在。'
    };
    function pair(a, b) {
      var w = pick(a, b), l = (w === a) ? b : a;
      return dict[w] + '　票数 ' + c[w] + ' : ' + c[l];
    }
    var note = '你的性格编码：' + code + '　俗称「' + (nick[code] || '16 型之一') + '」\n\n' +
      '· 精力来源：' + pair('E', 'I') + '\n' +
      '· 接收信息：' + pair('S', 'N') + '\n' +
      '· 做决定：' + pair('T', 'F') + '\n' +
      '· 生活方式：' + pair('J', 'P') + '\n\n' +
      '注意：MBTI 描述的是“偏好风格”，不是能力高低，更与心理健康无关。四对字母只说明你更习惯哪条路，不代表另一条走不了；票数接近（如 3:1 以内）说明两条路你都能走，环境与练习会放大你用得少的那一面。';
    return {
      badge: 'MBTI 16 型', color: '#46607a', title: code + ' · ' + (nick[code] || ''),
      note: note,
      sug: '别让字母定义你，让它提醒你：①知道自己靠什么充电（独处/人群）就不会硬撑错场合；②遇到“想不明白的人”，大概率是对方偏好不同——用对方习惯的方式说话，沟通会顺很多；③若想更深入了解自己，可再测一次官方完整版或找专业解读。'
    };
  }
},
/* ═══════════════════ 中医 · 佛家 原创自省（非量表） ═══════════════════ */
{
  id: 'qixing', src: 'tcm', self: true, name: '七情五志 · 自省',
  sub: '看你的情绪底色与哪个脏腑最相关（趣味自省）',
  base: '借鉴《中医心理学》：怒喜思悲恐五志、七情内伤之“过则伤脏”',
  questions: [
    { q: '常有一股无名火：容易怼人、路怒，或心里憋着气没处发。', opts: [ { t: '很少', s: 0 }, { t: '有时', s: 1 }, { t: '经常', s: 2 }, { t: '几乎总是', s: 3 } ] },
    { q: '爱操心、想太多：一件小事翻来覆去，吃饭也在琢磨。', opts: [ { t: '很少', s: 0 }, { t: '有时', s: 1 }, { t: '经常', s: 2 }, { t: '几乎总是', s: 3 } ] },
    { q: '总觉得心里压着事、闷闷不乐，叹气才舒服一点。', opts: [ { t: '很少', s: 0 }, { t: '有时', s: 1 }, { t: '经常', s: 2 }, { t: '几乎总是', s: 3 } ] },
    { q: '常莫名紧张、害怕，或一遇事就心慌、想躲。', opts: [ { t: '很少', s: 0 }, { t: '有时', s: 1 }, { t: '经常', s: 2 }, { t: '几乎总是', s: 3 } ] },
    { q: '情绪一来，身体就有反应：或偏头痛，或胃胀没胃口，或胸闷。', opts: [ { t: '很少', s: 0 }, { t: '有时', s: 1 }, { t: '经常', s: 2 }, { t: '几乎总是', s: 3 } ] },
    { q: '委屈憋着不说，宁可自己消化，也不愿让别人知道。', opts: [ { t: '很少', s: 0 }, { t: '有时', s: 1 }, { t: '经常', s: 2 }, { t: '几乎总是', s: 3 } ] },
    { q: '情绪像过山车：高兴时很亢奋，低落时整个人蔫掉。', opts: [ { t: '很少', s: 0 }, { t: '有时', s: 1 }, { t: '经常', s: 2 }, { t: '几乎总是', s: 3 } ] },
    { q: '最近总觉得累，睡不醒、没力气、对什么都没兴趣。', opts: [ { t: '很少', s: 0 }, { t: '有时', s: 1 }, { t: '经常', s: 2 }, { t: '几乎总是', s: 3 } ] }
  ],
  ranges: [
    { to: 5, badge: '情 志 和 畅', title: '七情平顺，气机不堵', color: '#4f6f47',
      note: '中医讲“情志和则百脉安”，你大多时候能让情绪自然来去，没有长期淤积的痕迹。',
      sug: '保持“疏泄有路”：每周有运动或散步让气机流通，有不快及时说出口——情绪最怕“憋”字。' },
    { to: 12, badge: '情 志 有 淤', title: '有一两股情绪在身体里记账了', color: '#b98e4e',
      note: '从中医心理学看，你某些情绪积得偏久：偏怒者肝气易郁（肩颈紧、易叹气），偏思者脾气易结（胃胀、想事停不下），偏忧者肺气易耗（气短、闷），偏恐者肾气易亏（心慌、腰酸）。这是身体在替你记账，提醒该疏通了。',
      sug: '试试中医心理的“情志相胜”思路：怒时用“悲悯”看对方难处，思虑过度去运动出汗，忧闷去大声唱歌或快走，恐惧做深呼吸把气沉到丹田。再加一招通用“疏肝理气”：双手叉腰、扩胸深呼吸十次，边做边叹气也没关系，把郁气叹出去。' },
    { to: 24, badge: '情 志 偏 盛', title: '情绪积得久，身体先报警了', color: '#a0392a',
      note: '某种情绪已在你身上积成“惯性”：怒、思、忧或恐占了主导，且已伴随明显的身体信号（头紧、胃堵、胸闷、心慌、极度疲劳）。中医心理学称此为“情志内伤”，身心已经连成一体在喊累。',
      sug: '请“身心同治”：身体方面先看中医调理（疏肝/健脾/安神各有路数），该查体查体；心理方面配合咨询把积压的情绪说出口。日常先做最温和的功课：每天快走或八段锦 30 分钟（动则生阳、郁气得散），睡前热水泡脚（引火下行、安神）。你这不是“想太多”，是身心都需要系统休养。' }
  ]
},
{
  id: 'shenqi', src: 'tcm', self: true, name: '心神耗损 · 自省',
  sub: '睡不踏实、容易受惊、神疲健忘——“心主神明”的白话版',
  base: '借鉴《中医心理学》：心主神明、神不守舍与失眠健忘之辨',
  questions: [
    { q: '睡眠浅、多梦，梦多且累，像一夜没歇过。', opts: [ { t: '很少', s: 0 }, { t: '有时', s: 1 }, { t: '经常', s: 2 }, { t: '几乎总是', s: 3 } ] },
    { q: '容易受惊吓：一点声响就一激灵，心口怦怦跳。', opts: [ { t: '很少', s: 0 }, { t: '有时', s: 1 }, { t: '经常', s: 2 }, { t: '几乎总是', s: 3 } ] },
    { q: '丢三落四、话到嘴边就忘，注意力像漏水的桶。', opts: [ { t: '很少', s: 0 }, { t: '有时', s: 1 }, { t: '经常', s: 2 }, { t: '几乎总是', s: 3 } ] },
    { q: '心里总觉得不踏实、悬着，说不上在怕什么。', opts: [ { t: '很少', s: 0 }, { t: '有时', s: 1 }, { t: '经常', s: 2 }, { t: '几乎总是', s: 3 } ] },
    { q: '白天神疲乏力，坐着就想打盹，脑子昏沉不清爽。', opts: [ { t: '很少', s: 0 }, { t: '有时', s: 1 }, { t: '经常', s: 2 }, { t: '几乎总是', s: 3 } ] },
    { q: '夜里躺下，脑子反而清醒兴奋，越想静越静不下来。', opts: [ { t: '很少', s: 0 }, { t: '有时', s: 1 }, { t: '经常', s: 2 }, { t: '几乎总是', s: 3 } ] },
    { q: '容易心慌、心悸，或感觉心跳快而乱，尤其安静时明显。', opts: [ { t: '很少', s: 0 }, { t: '有时', s: 1 }, { t: '经常', s: 2 }, { t: '几乎总是', s: 3 } ] },
    { q: '情绪易波动，一件小事就慌神或烦躁，心难安住。', opts: [ { t: '很少', s: 0 }, { t: '有时', s: 1 }, { t: '经常', s: 2 }, { t: '几乎总是', s: 3 } ] }
  ],
  ranges: [
    { to: 5, badge: '神 安 气 和', title: '心神守得住，根基稳', color: '#4f6f47',
      note: '从中医“心主神明”看，你的神比较安：睡得沉、心不慌、记性在线。',
      sug: '养护心神最忌“熬夜耗阴”。保持规律作息，午间小憩 15 分钟养神，别让手机偷走子时觉（23 点前入睡最佳）。' },
    { to: 12, badge: '神 有 些 浮', title: '心神有点浮，该收一收了', color: '#b98e4e',
      note: '你处于“心神偏浮”状态：睡浅梦多、易惊易忘、心悬不落。中医多责之心血不足或思虑过度，把“神”耗得有点守不住舍。',
      sug: '中医安神小方（非药）：①睡前 1 小时放下手机，温水泡脚 15 分钟，引火下行、心神归舍；②白天想事太多时，静坐数息 10 分钟，给心神一个“下班”时间；③食疗可试：龙眼肉+红枣煮水（补心脾、养心安神）、百合莲子羹（清心安神）。若心慌明显，先查体排除器质问题，再谈调理。' },
    { to: 24, badge: '神 不 守 舍', title: '你的心神太累了，该大修一次', color: '#a0392a',
      note: '你的“神”已经明显不安其位：严重失眠多梦、心悸易惊、健忘恍惚、白天昏沉。长期如此，中医称之为“心神失养”，身心相互拖累已成循环。',
      sug: '请认真对待：①先做一次体检（尤其心电图、甲功等排查器质性心慌）；②中医辨证调理（养心安神/交通心肾等方药配合针灸推拿都有效）；③心理上减少思虑源，配合正念/咨询让脑子“停机”。日常先做三件小事：亥时（21-23 点）准备入睡、白天适度运动微微出汗、睡前不看任何屏幕改听舒缓音乐。' }
  ]
},
{
  id: 'mercy', src: 'bud', self: true, name: '慈悲与自悯 · 自省',
  sub: '你对自己温柔吗？对世界还有多少暖',
  base: '借鉴佛家四无量心 + 西方自我关怀研究（Neff）白话化自省',
  questions: [
    { q: '做砸了事，心里骂自己比谁都狠，换朋友早安慰上了。', opts: [ { t: '几乎从不', s: 0 }, { t: '有时', s: 1 }, { t: '经常', s: 2 }, { t: '几乎总是', s: 3 } ] },
    { q: '一闲下来就容易挑自己毛病，觉得自己处处不如人。', opts: [ { t: '几乎从不', s: 0 }, { t: '有时', s: 1 }, { t: '经常', s: 2 }, { t: '几乎总是', s: 3 } ] },
    { q: '看到别人受苦，你会难受，但“帮不上”的无力感会让你想逃开。', opts: [ { t: '几乎从不', s: 0 }, { t: '有时', s: 1 }, { t: '经常', s: 2 }, { t: '几乎总是', s: 3 } ] },
    { q: '对不熟的人客气，对亲近的人反而苛刻、不耐烦。', opts: [ { t: '几乎从不', s: 0 }, { t: '有时', s: 1 }, { t: '经常', s: 2 }, { t: '几乎总是', s: 3 } ] },
    { q: '见别人过得好，心里先冒酸水，很难纯粹地替他高兴。', opts: [ { t: '几乎从不', s: 0 }, { t: '有时', s: 1 }, { t: '经常', s: 2 }, { t: '几乎总是', s: 3 } ] },
    { q: '受了委屈习惯硬扛，从不敢说“我需要被照顾”。', opts: [ { t: '几乎从不', s: 0 }, { t: '有时', s: 1 }, { t: '经常', s: 2 }, { t: '几乎总是', s: 3 } ] },
    { q: '想起某个伤害过你的人，心口还是堵的，无法祝他平安。', opts: [ { t: '几乎从不', s: 0 }, { t: '有时', s: 1 }, { t: '经常', s: 2 }, { t: '几乎总是', s: 3 } ] },
    { q: '你给别人的耐心与善意，远多于给自己的那一份。', opts: [ { t: '几乎从不', s: 0 }, { t: '有时', s: 1 }, { t: '经常', s: 2 }, { t: '几乎总是', s: 3 } ] }
  ],
  ranges: [
    { to: 5, badge: '心 炉 正 暖', title: '你既暖自己，也暖得了别人', color: '#4f6f47',
      note: '你的自我关怀与对他人的善意都挺足，心里存着不少暖，这是很难得的底子。',
      sug: '把暖意变成“日课”：每天在心里默默祝一个人安好——从感恩的人到“看不顺眼”的人。暖意像涟漪，最后会回到你自己身上。' },
    { to: 12, badge: '心 炉 有 风', title: '你常暖别人，却漏了暖自己', color: '#b98e4e',
      note: '你对世界多半慷慨，唯独对自己苛刻：骂自己狠、给自己少、委屈硬扛。慈悲若只向外不向内，炉火会慢慢烧空。',
      sug: '先练“对自己说软话”：把骂自己的话，换成安慰好朋友的话说给自己听。研究（Neff 自我关怀）证实：自我关怀不是纵容，反而能让人更有行动力、更少内耗。每天一句，七天见效。' },
    { to: 24, badge: '心 炉 偏 冷', title: '不是你没暖意，是它被冻住了', color: '#a0392a',
      note: '你对自己、对世界都存了不少戒备与苛刻——这多半是受过伤之后长出的壳。壳硬，是因为里面怕再疼。佛家说这是“心被瞋怨所覆”，需要先暖自己。',
      sug: '请先别急着“原谅全世界”，只做最小两步：①每天写一条“我今天值得被感谢的地方”（哪怕只是按时吃饭）；②对自己说“我值得被好好对待”，说到自己信为止。若心里的冷与空伴随长期低落，请同时寻求专业陪伴——把壳焐开，需要时间，也需要有人不只你一个。' }
  ]
}
];

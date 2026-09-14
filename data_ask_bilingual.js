/* ============================================================
 * 心斋 · 问心问答双语扩展
 * 原中文答案保持不变；本层补充英文摘要、关联词汇与心斋建议。
 * 建议字段中的“心斋建议”受藏传佛教慈悲与智慧传统启发，非真实宗教人物本人发言。
 * ============================================================ */

var ASK_BILINGUAL = {
  '专注力差、坐不住、效率低': {
    nameEn: 'Poor focus, restlessness, and low productivity',
    queryEn: 'I keep getting distracted, cannot sit still, procrastinate, and cannot finish my work.',
    searchEn: 'focus attention distraction procrastination productivity restlessness phone task switching',
    en: 'When attention keeps drifting, start with the environment rather than blaming your willpower. Put the phone away, choose one small task, and return gently whenever the mind wanders.',
    enZh: '当注意力不断飘走时，先调整环境，不要急着责怪自己的意志力。把手机放远，选择一个小任务；每次走神，都温和地回来。',
    psychEn: 'Psychology explains that distraction is not simply a lack of willpower. Reduce cues, lower the starting cost, and protect single-task attention.',
    psychZh: '心理学补充：分心不只是意志力不足。减少诱因、降低启动成本，并保护一次只做一件事的注意力。',
    psychAnsEn: 'Psychology explains that drifting attention is not simply a lack of willpower. Three useful steps are to remove the phone from the room, start with five minutes, and do one task at a time because switching tasks is a major source of lost attention.',
    psychSupplementEn: 'A wandering mind is not proof that you are a failure. Change the environment, lower the starting cost, and treat each gentle return as one repetition of attention training.',
    psychSupplementZh: '走神并不证明你是一个失败的人。调整环境，降低启动成本，把每次温和地回来都看成一次注意力训练。',
    terms: 'attention · distraction · procrastination · task switching · five-minute start',
    compassion: '走神并不证明你是一个失败的人。先对自己少一点责备，把一次“回来”看成一次训练；今天只完成眼前五分钟，已经是在为清明铺路。',
    compassionEn: 'A wandering mind does not make you a failure. Treat each return as one repetition of the training. Five focused minutes today are already a path toward clarity.'
  },
  '焦虑、紧张、担忧不断': {
    nameEn: 'Anxiety, tension, and constant worry',
    queryEn: 'I feel anxious all the time. I can’t stop worrying about things that might happen. I can’t relax.',
    searchEn: 'anxiety anxious stress tension worry fear panic uncertainty grounding relaxation',
    en: 'Anxiety often spends today’s energy on an uncertain future. Name what is known, slow the body with a longer exhale, and choose one action that belongs to this moment.',
    enZh: '焦虑常把今天的力气花在不确定的未来。先说清已知的事实，用更长的呼气让身体慢下来，再选择一件属于此刻的行动。',
    psychEn: 'Psychology views anxiety as a cycle of threat prediction and uncertainty avoidance. Grounding, scheduled worry, and gradual coping can weaken that cycle.',
    psychZh: '心理学补充：焦虑常由威胁预测和回避不确定性形成循环。落地练习、安排担忧时间和逐步面对，都能削弱这个循环。',
    psychAnsEn: 'Anxiety is often the result of spending today\'s energy on an uncertain future. Write down the worst possible outcome and ask whether you could cope with it, use 4-7-8 breathing to relax the body, and set aside a specific time for worrying. If tension and sleeplessness continue for weeks, consider professional support.',
    psychSupplementEn: 'You do not have to become fearless at once. Name the fear, then ask what would reduce harm in this moment. Compassion means not attacking yourself while fear is present.',
    psychSupplementZh: '不必要求自己立刻不怕。先承认“我正在害怕”，再问“此刻怎样做能少一点伤害？”慈悲是在恐惧中不再攻击自己。',
    terms: 'anxiety · uncertainty · worry time · grounding · longer exhale',
    compassion: '不必要求自己立刻不怕。先承认“我正在害怕”，再问“此刻怎样做能少一点伤害？”慈悲不是纵容恐惧，而是在恐惧中不再攻击自己。',
    compassionEn: 'You do not have to become fearless at once. Name the fear, then ask what would reduce harm in this moment. Compassion means not attacking yourself while fear is present.'
  },
  '失眠、睡不好': {
    nameEn: 'Insomnia and poor sleep',
    queryEn: 'I can’t fall asleep. I keep waking up at night. I’m tired all day because of my sleep.',
    searchEn: 'insomnia sleep cannot sleep wake up at night tired exhaustion bedtime caffeine',
    en: 'Sleep becomes harder when the bed turns into a place of struggle. Reduce stimulation, keep a steady waking time, and step away from the bed briefly if you are becoming more tense.',
    enZh: '当床变成与清醒搏斗的地方，睡眠会更困难。减少刺激，固定起床时间；如果越躺越紧张，可以暂时离开床一会儿。',
    psychEn: 'Sleep psychology emphasizes a stable wake time, lower evening stimulation, and breaking the association between bed and anxious struggle.',
    psychZh: '睡眠心理学强调固定起床时间、减少夜间刺激，并打破“床等于焦虑挣扎”的联系。',
    psychAnsEn: 'Insomnia is often made worse by trying too hard to force sleep. Use the bed only for sleep, leave it after about 20 minutes if you remain awake and tense, return when sleepy, keep a regular wake time, avoid long daytime naps, and limit caffeine after early afternoon.',
    psychSupplementEn: 'Sleep psychology emphasizes having a set wake-up time, reducing nighttime stimulation, and breaking the link between bed and anxious struggle.',
    psychSupplementZh: '睡眠心理学强调固定起床时间、减少夜间刺激，并打破“床等于焦虑挣扎”的联系。',
    terms: 'insomnia · sleep pressure · sleep routine · rumination · stimulus control',
    compassion: '今夜睡得不好，不等于明天的人生就毁了。先停止和清醒搏斗，照顾好身体；持续失眠影响生活时，及时寻求专业帮助。',
    compassionEn: 'One difficult night does not ruin your life tomorrow. Stop fighting wakefulness and care for the body. Seek professional support when persistent insomnia affects daily life.'
  },
  '情绪低落、提不起劲': {
    nameEn: 'Low mood and loss of motivation',
    queryEn: 'I feel down all the time. I don’t enjoy anything anymore. I can’t find the energy to do anything.',
    searchEn: 'low mood depression sad hopeless no interest motivation energy self worth help',
    en: 'Low mood deserves care, not a moral judgment. Notice how long it has lasted, take one small action that restores contact with life, and seek professional support when symptoms persist or safety becomes uncertain.',
    enZh: '低落需要被照顾，而不是被道德评判。留意它持续了多久，做一件让自己重新接触生活的小事；如果持续或安全感变差，请寻求专业帮助。',
    psychEn: 'Psychology distinguishes a passing low mood from persistent symptoms such as loss of interest, low energy, and self-blame. Small meaningful actions and professional support both matter.',
    psychZh: '心理学补充：短暂低落与持续的兴趣减退、精力下降、自我否定需要区别对待。小而有意义的行动和专业支持都很重要。',
    psychAnsEn: 'Psychology distinguishes a few days of low energy from persistent low mood, loss of interest, self-criticism, or changes in sleep and appetite. Get sunlight, keep a regular routine, complete one very small task, and seek professional support when symptoms last two weeks or more.',
    psychSupplementEn: 'Low mood deserves care rather than moral judgment. Notice how long it has lasted, take one small action that reconnects you with life, and tell someone trustworthy how you are doing.',
    psychSupplementZh: '低落需要被照顾，而不是被道德评判。留意它持续了多久，做一件让自己重新接触生活的小事，并让可信任的人知道你的状态。',
    terms: 'low mood · loss of interest · behavioral activation · self-worth · professional support',
    compassion: '低落时不要用“我应该振作”再压自己一次。今天只做一件小而真实的事，并让可信任的人知道你的状态；求助不是软弱，是在保护生命的光。',
    compassionEn: 'Do not use “I should be stronger” to hurt yourself again. Do one small real thing today and let someone trustworthy know how you are. Asking for help protects the light of life.'
  },
  '爱生气、脾气暴': {
    nameEn: 'Anger and a short temper',
    queryEn: 'I lose my temper easily, get angry quickly, and regret what I say afterward.',
    searchEn: 'anger angry irritability temper rage frustration emotion regulation boundary repair',
    en: 'Anger is a signal, but it does not have to become an action. Step away before speaking, let the body cool down, then address the boundary or need beneath the anger.',
    enZh: '愤怒是一种信号，但不必立刻变成行动。开口前先离开现场，让身体冷却，再处理愤怒下面的边界或需要。',
    psychEn: 'Emotion regulation does not mean suppressing anger. Pause, lower arousal, identify the trigger, and repair the relationship after the peak has passed.',
    psychZh: '情绪调节不等于压抑愤怒。先暂停、降低唤醒水平，找到触发点，并在情绪峰值过去后修复关系。',
    psychAnsEn: 'Anger management is not about never feeling angry. When you feel an outburst coming, step away, take three breaths, and count to twelve before speaking. Once the thinking brain is available again, address the boundary that was crossed and repair any harm.',
    psychSupplementEn: 'You are not your anger. Protect people from the fire first, then look at the boundary that was crossed. Preventing one act of harm is compassion in action.',
    psychSupplementZh: '你不是你的怒火。先保护眼前的人不被火焰烧伤，再回头看是谁的边界被碰到了。能止住一次伤害，就是慈悲已经开始行动。',
    terms: 'anger · emotion regulation · boundary · cooling-off period · repair attempt',
    compassion: '你不是你的怒火。先保护眼前的人不被火焰烧伤，再回头看是谁的边界被碰到了；能止住一次伤害，就是慈悲已经开始行动。',
    compassionEn: 'You are not your anger. Protect people from the fire first, then look at the boundary that was crossed. Preventing one act of harm is compassion in action.'
  },
  '想太多、思虑过度、钻牛角尖': {
    nameEn: 'Overthinking and rumination',
    queryEn: 'I keep thinking about the same thing over and over. I can’t stop my mind. I overthink everything.',
    searchEn: 'overthinking rumination intrusive thoughts worry regret cannot stop thinking cognitive defusion',
    en: 'Rumination can feel like problem-solving while producing no new information. Write down the facts, name the feeling, and choose one next step; let the rest wait outside the mind for now.',
    enZh: '反复思考有时像是在解决问题，实际上没有产生新的信息。写下事实，命名感受，选择下一步；其余的暂时放在脑外。',
    psychEn: 'Cognitive approaches separate useful problem-solving from rumination. Label the thought, test the evidence, and shift toward one observable action.',
    psychZh: '认知方法会区分有用的问题解决与反刍。给念头命名，检验证据，再转向一个可观察的行动。',
    psychAnsEn: 'Rumination is difficult to stop because the mind mistakes thinking for solving. Write down the facts, name the feeling, divide the situation into what you can change and what you cannot, and choose one next step. Movement can also interrupt the loop.',
    psychSupplementEn: 'When thoughts multiply, you do not need to judge every one. Notice and name the thought, then return to the small step beneath your feet. The mind is a place to train gently, not an enemy to conquer.',
    psychSupplementZh: '念头很多时，不必把每个念头都审判一遍。看见并命名它，然后把注意力放回脚下这一小步。心需要被温柔训练，而不是被征服。',
    terms: 'rumination · overthinking · cognitive defusion · facts and interpretations · next step',
    compassion: '念头很多时，不必把每个念头都审判一遍。看见它、给它一个名字，然后把注意力放回脚下这一小步；心不是要被征服的敌人，而是需要被温柔训练的地方。',
    compassionEn: 'When thoughts multiply, you do not need to judge every one. Notice it, name it, and return to the small step beneath your feet. The mind is not an enemy to conquer, but a place to train gently.'
  }
};

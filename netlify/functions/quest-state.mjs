import {
    QUEST_TASK_IDS,
    buildQuestStatePayload,
    createQuestStateHeaders,
    json,
    readQuestState
} from './_quest-state.mjs';

const QUEST_TASK_ID_SET = new Set(QUEST_TASK_IDS);

export async function handler(event) {
    if (event.httpMethod === 'GET') {
        return json(200, buildQuestStatePayload(readQuestState(event)));
    }

    if (event.httpMethod !== 'POST') {
        return json(405, { ok: false, message: 'METHOD_NOT_ALLOWED' });
    }

    let payload = {};
    try {
        payload = JSON.parse(event.body || '{}');
    } catch {
        return json(400, { ok: false, message: 'INVALID_JSON' });
    }

    const taskId = String(payload.taskId || '');
    if (!QUEST_TASK_ID_SET.has(taskId)) {
        return json(400, { ok: false, message: 'INVALID_TASK_ID' });
    }

    const currentTasks = readQuestState(event);
    const nextTasks = currentTasks.includes(taskId) ? currentTasks : [...currentTasks, taskId];

    return json(
        200,
        buildQuestStatePayload(nextTasks),
        createQuestStateHeaders(nextTasks)
    );
}

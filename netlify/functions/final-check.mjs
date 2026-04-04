import {
    generateProtectedCode,
    getSecretWord,
    hasCompletedAllTasks,
    json,
    normalizeWord,
    readQuestState
} from './_quest-state.mjs';

export async function handler(event) {
    if (event.httpMethod !== 'POST') {
        return json(405, { ok: false, message: 'METHOD_NOT_ALLOWED' });
    }

    let payload = {};
    try {
        payload = JSON.parse(event.body || '{}');
    } catch {
        return json(400, { ok: false, message: 'INVALID_JSON' });
    }

    const inputWord = normalizeWord(payload.word);
    const completedTasks = readQuestState(event);

    if (!hasCompletedAllTasks(completedTasks)) {
        return json(403, { ok: false, message: 'QUEST_INCOMPLETE' });
    }

    if (inputWord !== getSecretWord()) {
        return json(403, { ok: false, message: 'INVALID_COMBINATION' });
    }

    return json(200, {
        ok: true,
        code: generateProtectedCode()
    });
}

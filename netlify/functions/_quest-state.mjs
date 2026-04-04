import crypto from 'node:crypto';

export const QUEST_TASK_IDS = [
    'quest-cb-cat',
    'balance-checkbox',
    'quest-cb-snitch',
    'quest-cb-proxy',
    'quest-cb-break'
];

export const QUEST_TASK_FRAGMENT_MAP = {
    'quest-cb-cat': 1,
    'balance-checkbox': 0,
    'quest-cb-snitch': 2,
    'quest-cb-proxy': 3,
    'quest-cb-break': 4
};

const QUEST_TASK_ID_SET = new Set(QUEST_TASK_IDS);
const QUEST_STATE_COOKIE_NAME = 'bb_quest_state';
const QUEST_STATE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const DEFAULT_QUEST_STATE_SECRET = 'bb-quest-state-default-secret';
const DEFAULT_SECRET_WORD = 't1x0_t1x0';
const DEFAULT_CODE_PREFIX = 'L0N4_F1SHER_SECRET';

export function json(statusCode, payload, extraHeaders = {}) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
            ...extraHeaders
        },
        body: JSON.stringify(payload)
    };
}

export function normalizeWord(value) {
    return String(value || '').trim().toLowerCase();
}

export function getSecretWord() {
    return normalizeWord(process.env.TERMINAL_SECRET_WORD || DEFAULT_SECRET_WORD);
}

export function generateProtectedCode() {
    const prefix = process.env.TERMINAL_CODE_PREFIX || DEFAULT_CODE_PREFIX;
    const stamp = Math.floor(Date.now() / 1000).toString(36).toUpperCase();
    const nonce = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `${prefix}-${stamp}${nonce}`;
}

function getQuestStateSecret() {
    return process.env.QUEST_STATE_SECRET || DEFAULT_QUEST_STATE_SECRET;
}

function parseCookies(cookieHeader = '') {
    return cookieHeader
        .split(';')
        .map((part) => part.trim())
        .filter(Boolean)
        .reduce((cookies, part) => {
            const separatorIndex = part.indexOf('=');
            if (separatorIndex === -1) return cookies;

            const key = part.slice(0, separatorIndex).trim();
            const value = part.slice(separatorIndex + 1).trim();
            cookies[key] = value;
            return cookies;
        }, {});
}

function normalizeTasks(tasks) {
    const filtered = Array.isArray(tasks) ? tasks.filter((taskId) => QUEST_TASK_ID_SET.has(taskId)) : [];
    return [...new Set(filtered)].sort((left, right) => QUEST_TASK_IDS.indexOf(left) - QUEST_TASK_IDS.indexOf(right));
}

function signQuestState(encodedPayload) {
    return crypto
        .createHmac('sha256', getQuestStateSecret())
        .update(encodedPayload)
        .digest('base64url');
}

function serializeQuestState(tasks) {
    const payload = Buffer.from(JSON.stringify({ tasks: normalizeTasks(tasks) }), 'utf8').toString('base64url');
    const signature = signQuestState(payload);
    return `${payload}.${signature}`;
}

export function readQuestState(event) {
    const cookieHeader = event?.headers?.cookie || event?.headers?.Cookie || '';
    const cookies = parseCookies(cookieHeader);
    const rawValue = cookies[QUEST_STATE_COOKIE_NAME];

    if (!rawValue) {
        return [];
    }

    const [payload, signature] = rawValue.split('.');
    if (!payload || !signature || signQuestState(payload) !== signature) {
        return [];
    }

    try {
        const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        return normalizeTasks(decoded.tasks);
    } catch {
        return [];
    }
}

export function createQuestStateHeaders(tasks) {
    return {
        'Set-Cookie': [
            `${QUEST_STATE_COOKIE_NAME}=${serializeQuestState(tasks)}`,
            'Path=/',
            'HttpOnly',
            'Secure',
            'SameSite=Lax',
            `Max-Age=${QUEST_STATE_MAX_AGE_SECONDS}`
        ].join('; ')
    };
}

export function hasCompletedAllTasks(tasks) {
    return normalizeTasks(tasks).length === QUEST_TASK_IDS.length;
}

export function buildQuestStatePayload(tasks) {
    const completedTasks = normalizeTasks(tasks);

    return {
        ok: true,
        completedTasks,
        fragmentIndexes: completedTasks
            .map((taskId) => QUEST_TASK_FRAGMENT_MAP[taskId])
            .filter((fragmentIndex) => Number.isInteger(fragmentIndex)),
        allDone: completedTasks.length === QUEST_TASK_IDS.length
    };
}

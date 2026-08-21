-- Descarta as tarefas legadas criadas antes do sistema de usuários.
-- Nenhuma tarefa anônima será preservada ou atribuída artificialmente
-- a um usuário: após esta migration, toda tarefa pertence a um usuário.
DELETE FROM tasks;

ALTER TABLE tasks
    ADD COLUMN user_id BIGINT UNSIGNED NOT NULL AFTER id,
    ADD KEY idx_tasks_user_id (user_id),
    ADD CONSTRAINT fk_tasks_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE;

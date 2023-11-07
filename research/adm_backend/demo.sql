-- Inserting sample data into the Users Table
INSERT INTO users (name, mail) VALUES
  ('John Doe', 'john@example.com'),
  ('Jane Smith', 'jane@example.com'),
  ('Alice Johnson', 'alice@example.com');

-- Inserting sample data into the Projects Table
INSERT INTO projects (name, description, git_link) VALUES
  ('Project A', 'This is project A description', 'https://github.com/projectA'),
  ('Project B', 'Description for Project B', 'https://github.com/projectB'),
  ('Project C', 'Another project description', 'https://github.com/projectC');

-- Inserting sample data into the Architectures Table
INSERT INTO architectures (name, description, git_link) VALUES
  ('Arch A', 'Architecture A description', 'https://github.com/architectureA'),
  ('Arch B', 'Description for Architecture B', 'https://github.com/architectureB'),
  ('Arch C', 'Another architecture description', 'https://github.com/architectureC');

-- Inserting sample data into the ADRs Table
INSERT INTO adrs (name, description, git_link) VALUES
  ('ADR 1', 'ADR 1 description', 'https://github.com/adr1'),
  ('ADR 2', 'Description for ADR 2', 'https://github.com/adr2'),
  ('ADR 3', 'Another ADR description', 'https://github.com/adr3');

-- Inserting sample data into the Groups Table
INSERT INTO groups (name, description) VALUES
  ('Group 1', 'Description for Group 1'),
  ('Group 2', 'Group 2 description'),
  ('Group 3', 'Another group description');

-- Inserting sample data into the Relationship Tables

-- Groups Users Relationship Table
INSERT INTO groups_users_rel (user_id, group_id) VALUES
  ('UUID_of_user_1', 'UUID_of_group_1'),
  ('UUID_of_user_2', 'UUID_of_group_2'),
  ('UUID_of_user_3', 'UUID_of_group_3');

-- Projects Architectures Relationship Table
INSERT INTO projects_architectures_rel (project_id, architecture_id) VALUES
  ('UUID_of_project_A', 'UUID_of_arch_A'),
  ('UUID_of_project_B', 'UUID_of_arch_B'),
  ('UUID_of_project_C', 'UUID_of_arch_C');

-- Users Projects Relationship Table
INSERT INTO users_projects_rel (user_id, project_id) VALUES
  ('UUID_of_user_1', 'UUID_of_project_A'),
  ('UUID_of_user_2', 'UUID_of_project_B'),
  ('UUID_of_user_3', 'UUID_of_project_C');

-- Projects ADR Relationship Table
INSERT INTO projects_adr_rel (project_id, adr_id) VALUES
  ('UUID_of_project_A', 'UUID_of_ADR_1'),
  ('UUID_of_project_B', 'UUID_of_ADR_2'),
  ('UUID_of_project_C', 'UUID_of_ADR_3');

-- Projects Groups Relationship Table
INSERT INTO projects_groups_rel (project_id, group_id) VALUES
  ('UUID_of_project_A', 'UUID_of_group_1'),
  ('UUID_of_project_B', 'UUID_of_group_2'),
  ('UUID_of_project_C', 'UUID_of_group_3');

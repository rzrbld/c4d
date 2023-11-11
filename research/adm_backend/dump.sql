-- Types
CREATE TYPE user_roles AS ENUM ('owner', 'writer', 'reader');

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    mail VARCHAR(255) NOT NULL,
    delete_ BOOLEAN DEFAULT false,
    date_created TIMESTAMPTZ DEFAULT NOW(),
    date_modified TIMESTAMPTZ DEFAULT NOW()
);

-- Projects Table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    git_link VARCHAR(255),
    delete_ BOOLEAN DEFAULT false,
    date_created TIMESTAMPTZ DEFAULT NOW(),
    date_modified TIMESTAMPTZ DEFAULT NOW()
);

-- Architectures Table
CREATE TABLE architectures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    git_link VARCHAR(255),
    delete_ BOOLEAN DEFAULT false,
    date_created TIMESTAMPTZ DEFAULT NOW(),
    date_modified TIMESTAMPTZ DEFAULT NOW()
);

-- ADRs (Architectural Decision Records) Table
CREATE TABLE adrs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    git_link VARCHAR(255),
    delete_ BOOLEAN DEFAULT false,
    date_created TIMESTAMPTZ DEFAULT NOW(),
    date_modified TIMESTAMPTZ DEFAULT NOW()
);

-- Groups Table
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    delete_ BOOLEAN DEFAULT false,
    date_created TIMESTAMPTZ DEFAULT NOW(),
    date_modified TIMESTAMPTZ DEFAULT NOW()
);

-- Groups Users Relationship Table
CREATE TABLE groups_users_rel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    group_id UUID REFERENCES groups(id),
    user_role user_roles;
    delete_ BOOLEAN DEFAULT false,
    date_created TIMESTAMPTZ DEFAULT NOW(),
    date_modified TIMESTAMPTZ DEFAULT NOW()
);

-- Projects Architectures Relationship Table
CREATE TABLE projects_architectures_rel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id),
    architecture_id UUID REFERENCES architectures(id),
    delete_ BOOLEAN DEFAULT false,
    date_created TIMESTAMPTZ DEFAULT NOW(),
    date_modified TIMESTAMPTZ DEFAULT NOW()
);

-- Users Projects Relationship Table
CREATE TABLE users_projects_rel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    project_id UUID REFERENCES projects(id),
    delete_ BOOLEAN DEFAULT false,
    date_created TIMESTAMPTZ DEFAULT NOW(),
    date_modified TIMESTAMPTZ DEFAULT NOW()
);

-- Projects ADR Relationship Table
CREATE TABLE projects_adr_rel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id),
    adr_id UUID REFERENCES adrs(id),
    delete_ BOOLEAN DEFAULT false,
    date_created TIMESTAMPTZ DEFAULT NOW(),
    date_modified TIMESTAMPTZ DEFAULT NOW()
);

-- Projects Groups Relationship Table
CREATE TABLE projects_groups_rel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id),
    group_id UUID REFERENCES groups(id),
    delete_ BOOLEAN DEFAULT false,
    date_created TIMESTAMPTZ DEFAULT NOW(),
    date_modified TIMESTAMPTZ DEFAULT NOW()
);

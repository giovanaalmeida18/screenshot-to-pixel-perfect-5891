-- Papéis de usuário (tabela separada, nunca no perfil)
create type public.app_role as enum ('admin', 'aluno');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Usuário vê o próprio papel"
  on public.user_roles for select to authenticated
  using (auth.uid() = user_id);

-- Perfis dos ex-alunos
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  course_taken text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create policy "Usuário vê o próprio perfil"
  on public.profiles for select to authenticated
  using (auth.uid() = id);
create policy "Usuário edita o próprio perfil"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);
create policy "Administradores veem todos os perfis"
  on public.profiles for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
create policy "Administradores editam perfis"
  on public.profiles for update to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Cria perfil e papel de aluno automaticamente no cadastro
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone, course_taken)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'course_taken'
  );
  insert into public.user_roles (user_id, role) values (new.id, 'aluno');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Cursos do projeto
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  workload integer,
  created_at timestamptz not null default now()
);
grant select on public.courses to authenticated;
grant all on public.courses to service_role;
alter table public.courses enable row level security;

create policy "Usuários autenticados veem cursos"
  on public.courses for select to authenticated using (true);
create policy "Administradores gerenciam cursos"
  on public.courses for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Vínculo entre ex-alunos e cursos
create table public.student_courses (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  participation_status text not null default 'em_andamento',
  completion_date date,
  created_at timestamptz not null default now(),
  unique (student_id, course_id)
);
grant select on public.student_courses to authenticated;
grant all on public.student_courses to service_role;
alter table public.student_courses enable row level security;

create policy "Aluno vê os próprios vínculos"
  on public.student_courses for select to authenticated
  using (auth.uid() = student_id);
create policy "Administradores gerenciam vínculos"
  on public.student_courses for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Biblioteca digital
create table public.materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null,
  content_type text not null default 'apostila',
  file_path text,
  external_url text,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
grant select on public.materials to authenticated;
grant all on public.materials to service_role;
alter table public.materials enable row level security;

create policy "Usuários autenticados veem materiais"
  on public.materials for select to authenticated using (true);
create policy "Administradores gerenciam materiais"
  on public.materials for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Comunicados
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  content text,
  category text not null default 'aviso',
  publication_date date not null default current_date,
  created_at timestamptz not null default now()
);
grant select on public.announcements to authenticated;
grant all on public.announcements to service_role;
alter table public.announcements enable row level security;

create policy "Usuários autenticados veem comunicados"
  on public.announcements for select to authenticated using (true);
create policy "Administradores gerenciam comunicados"
  on public.announcements for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Certificados
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  file_path text,
  issue_date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (student_id, course_id)
);
grant select on public.certificates to authenticated;
grant all on public.certificates to service_role;
alter table public.certificates enable row level security;

create policy "Aluno vê os próprios certificados"
  on public.certificates for select to authenticated
  using (auth.uid() = student_id);
create policy "Administradores gerenciam certificados"
  on public.certificates for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Oportunidades
create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null default 'curso',
  external_link text,
  deadline date,
  created_at timestamptz not null default now()
);
grant select on public.opportunities to authenticated;
grant all on public.opportunities to service_role;
alter table public.opportunities enable row level security;

create policy "Usuários autenticados veem oportunidades"
  on public.opportunities for select to authenticated using (true);
create policy "Administradores gerenciam oportunidades"
  on public.opportunities for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Índices
create index idx_student_courses_student on public.student_courses (student_id);
create index idx_certificates_student on public.certificates (student_id);
create index idx_materials_category on public.materials (category);
create index idx_announcements_date on public.announcements (publication_date desc);
create index idx_opportunities_category on public.opportunities (category);
# Database Migration Required

## Two-Portal System Setup

To enable the Student Portal vs Researcher/Admin Portal feature, you need to run this SQL migration in your Supabase SQL Editor:

### Migration SQL

```sql
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('student', 'researcher', 'admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies
CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE supabase_user_id = auth.uid()));

CREATE POLICY "Admins view all" ON public.user_roles
FOR SELECT USING (public.has_role((SELECT id FROM public.users WHERE supabase_user_id = auth.uid()), 'admin'));

CREATE POLICY "Admins insert roles" ON public.user_roles
FOR INSERT WITH CHECK (public.has_role((SELECT id FROM public.users WHERE supabase_user_id = auth.uid()), 'admin'));

-- Profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    age_range TEXT,
    gender TEXT,
    education_level TEXT,
    occupation TEXT,
    country TEXT,
    bio TEXT,
    interests TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles
FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE supabase_user_id = auth.uid()));

CREATE POLICY "Users insert own profile" ON public.profiles
FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.users WHERE supabase_user_id = auth.uid()));

CREATE POLICY "Users update own profile" ON public.profiles
FOR UPDATE USING (user_id IN (SELECT id FROM public.users WHERE supabase_user_id = auth.uid()));

CREATE POLICY "Admins view all profiles" ON public.profiles
FOR SELECT USING (public.has_role((SELECT id FROM public.users WHERE supabase_user_id = auth.uid()), 'admin'));

-- Auto-assign student role
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_created_assign_role
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Updated at trigger
CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Student activity function
CREATE OR REPLACE FUNCTION public.get_student_activity()
RETURNS TABLE (
  user_id UUID, email TEXT, display_name TEXT,
  total_sessions BIGINT, total_games BIGINT,
  last_active TIMESTAMPTZ, created_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, p.display_name,
    COUNT(DISTINCT s.id) as total_sessions,
    COUNT(DISTINCT r.game_id) as total_games,
    MAX(s.last_active_at) as last_active,
    u.created_at
  FROM public.users u
  LEFT JOIN public.profiles p ON p.user_id = u.id
  LEFT JOIN public.sessions s ON s.user_id = u.id
  LEFT JOIN public.results r ON r.session_id = s.id
  WHERE EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = u.id AND ur.role = 'student')
  GROUP BY u.id, u.email, p.display_name, u.created_at
  ORDER BY last_active DESC NULLS LAST;
END;
$$;

GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_student_activity TO authenticated;
```

### How to Grant Admin Access

After migration, assign admin role to specific users:

```sql
-- Replace 'user@email.com' with the actual email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM public.users
WHERE email = 'your-admin-email@example.com';
```

### Portal Access

- **Student Portal**: `/lobby` - All users (default)
- **Researcher Portal**: `/admin` or `/research` - Only admin/researcher roles

Only users with admin or researcher roles can access the admin portal!

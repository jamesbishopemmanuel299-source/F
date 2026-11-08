import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _signup = false;
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _busy = true; _error = null; });
    try {
      final auth = Supabase.instance.client.auth;
      if (_signup) {
        final response = await auth.signUp(
          email: _email.text.trim(),
          password: _password.text,
          data: {'full_name': _name.text.trim()},
        );
        if (response.session == null && mounted) {
          setState(() => _error = 'Account created. Check your email to confirm, then sign in.');
        }
      } else {
        await auth.signInWithPassword(
          email: _email.text.trim(),
          password: _password.text,
        );
      }
    } on AuthException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Something went wrong. Please try again.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Icon(Icons.movie_creation_rounded, size: 58, color: Color(0xFF9B7BFF)),
                    const SizedBox(height: 14),
                    const Text('EDITFLOW', textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, letterSpacing: 3)),
                    const SizedBox(height: 8),
                    Text(_signup ? 'Create your creator account' : 'Sign in to your creative studio',
                      textAlign: TextAlign.center, style: const TextStyle(color: Colors.white60)),
                    const SizedBox(height: 32),
                    if (_signup) ...[
                      TextFormField(controller: _name, decoration: const InputDecoration(labelText: 'Full name', prefixIcon: Icon(Icons.person_outline)),
                        validator: (v) => (v == null || v.trim().isEmpty) ? 'Enter your name' : null),
                      const SizedBox(height: 14),
                    ],
                    TextFormField(controller: _email, keyboardType: TextInputType.emailAddress,
                      decoration: const InputDecoration(labelText: 'Email address', prefixIcon: Icon(Icons.email_outlined)),
                      validator: (v) => (v == null || !v.contains('@')) ? 'Enter a valid email' : null),
                    const SizedBox(height: 14),
                    TextFormField(controller: _password, obscureText: true,
                      decoration: const InputDecoration(labelText: 'Password', prefixIcon: Icon(Icons.lock_outline)),
                      validator: (v) => (v == null || v.length < 6) ? 'Use at least 6 characters' : null),
                    if (_error != null) ...[
                      const SizedBox(height: 14),
                      Text(_error!, style: const TextStyle(color: Colors.orangeAccent)),
                    ],
                    const SizedBox(height: 22),
                    FilledButton(
                      onPressed: _busy ? null : _submit,
                      style: FilledButton.styleFrom(backgroundColor: const Color(0xFF7952E8), padding: const EdgeInsets.symmetric(vertical: 16)),
                      child: _busy
                          ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                          : Text(_signup ? 'Create account' : 'Sign in'),
                    ),
                    TextButton(
                      onPressed: _busy ? null : () => setState(() { _signup = !_signup; _error = null; }),
                      child: Text(_signup ? 'Already have an account? Sign in' : 'New here? Create an account'),
                    ),
                    if (!_signup)
                      TextButton(
                        onPressed: _busy ? null : () async {
                          final email = _email.text.trim();
                          if (!email.contains('@')) {
                            setState(() => _error = 'Enter your email address first.');
                            return;
                          }
                          try {
                            await Supabase.instance.client.auth.resetPasswordForEmail(email);
                            if (mounted) setState(() => _error = 'Password reset email sent.');
                          } on AuthException catch (e) {
                            if (mounted) setState(() => _error = e.message);
                          }
                        },
                        child: const Text('Forgot password?'),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _index = 0;

  static const _titles = ['Home', 'Video editor', 'AI studio', 'Projects', 'Profile'];

  @override
  Widget build(BuildContext context) {
    final pages = [
      _HomePage(onOpen: (i) => setState(() => _index = i)),
      const _FeaturePage(icon: Icons.movie_edit, title: 'Video editor', description: 'The native multi-track editor is being built here. Import video, arrange clips, add audio, titles, transitions and export your finished video.'),
      const _FeaturePage(icon: Icons.auto_awesome, title: 'AI studio', description: 'Native AI image, video, music and voice creation will connect to your existing secure generation backend.'),
      const _FeaturePage(icon: Icons.folder_copy_outlined, title: 'Your projects', description: 'Your saved projects and media library will appear here after the project database integration is completed.'),
      _ProfilePage(),
    ];
    return Scaffold(
      appBar: AppBar(
        title: Text(_titles[_index], style: const TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0D111B),
      ),
      body: IndexedStack(index: _index, children: pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.movie_outlined), selectedIcon: Icon(Icons.movie), label: 'Editor'),
          NavigationDestination(icon: Icon(Icons.auto_awesome_outlined), selectedIcon: Icon(Icons.auto_awesome), label: 'AI Studio'),
          NavigationDestination(icon: Icon(Icons.folder_outlined), selectedIcon: Icon(Icons.folder), label: 'Projects'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}

class _HomePage extends StatelessWidget {
  const _HomePage({required this.onOpen});
  final ValueChanged<int> onOpen;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const Text('Create something amazing.', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800)),
        const SizedBox(height: 8),
        const Text('Your creative studio, rebuilt for Android.', style: TextStyle(color: Colors.white60)),
        const SizedBox(height: 24),
        _ActionCard(icon: Icons.movie_creation_outlined, title: 'Edit a video', subtitle: 'Open the native timeline editor', onTap: () => onOpen(1)),
        _ActionCard(icon: Icons.auto_awesome, title: 'Generate with AI', subtitle: 'Images, videos, music and voice', onTap: () => onOpen(2)),
        _ActionCard(icon: Icons.folder_open, title: 'My projects', subtitle: 'Continue where you left off', onTap: () => onOpen(3)),
      ],
    );
  }
}

class _ActionCard extends StatelessWidget {
  const _ActionCard({required this.icon, required this.title, required this.subtitle, required this.onTap});
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Card(
    color: const Color(0xFF111827),
    margin: const EdgeInsets.only(bottom: 14),
    child: ListTile(
      contentPadding: const EdgeInsets.all(16),
      leading: CircleAvatar(backgroundColor: const Color(0xFF35245E), child: Icon(icon, color: const Color(0xFFC4B5FD))),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
      subtitle: Padding(padding: const EdgeInsets.only(top: 5), child: Text(subtitle)),
      trailing: const Icon(Icons.arrow_forward_ios, size: 16),
      onTap: onTap,
    ),
  );
}

class _FeaturePage extends StatelessWidget {
  const _FeaturePage({required this.icon, required this.title, required this.description});
  final IconData icon;
  final String title;
  final String description;

  @override
  Widget build(BuildContext context) => Center(
    child: SingleChildScrollView(
      padding: const EdgeInsets.all(28),
      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Icon(icon, size: 64, color: const Color(0xFFA78BFA)),
        const SizedBox(height: 20),
        Text(title, style: const TextStyle(fontSize: 25, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        Text(description, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white60, height: 1.6)),
      ]),
    ),
  );
}

class _ProfilePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final user = Supabase.instance.client.auth.currentUser;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const CircleAvatar(radius: 34, child: Icon(Icons.person, size: 36)),
          const SizedBox(height: 14),
          Text(user?.email ?? 'Creator', style: const TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          OutlinedButton.icon(
            onPressed: () async => Supabase.instance.client.auth.signOut(),
            icon: const Icon(Icons.logout),
            label: const Text('Sign out'),
          ),
        ]),
      ),
    );
  }
}

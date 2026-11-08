import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Reads and writes the same `projects` table used by the EditFlow website.
class ProjectsPage extends StatefulWidget {
  const ProjectsPage({super.key});

  @override
  State<ProjectsPage> createState() => _ProjectsPageState();
}

class _ProjectsPageState extends State<ProjectsPage> {
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _projects = [];

  @override
  void initState() {
    super.initState();
    _loadProjects();
  }

  Future<void> _loadProjects() async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) {
      setState(() {
        _loading = false;
        _error = 'Please sign in to see your projects.';
      });
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final rows = await Supabase.instance.client
          .from('projects')
          .select('id, project_name, aspect_ratio, duration_sec, updated_at, thumbnail_url')
          .eq('user_id', user.id)
          .order('updated_at', ascending: false);
      if (!mounted) return;
      setState(() {
        _projects = List<Map<String, dynamic>>.from(rows);
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = 'Could not load cloud projects. Check that the website and app use the same Supabase project and that the projects table is configured.';
        _loading = false;
      });
    }
  }

  Future<void> _createProject() async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return;
    final controller = TextEditingController(text: 'Untitled project');
    final name = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('New project'),
        content: TextField(
          controller: controller,
          autofocus: true,
          decoration: const InputDecoration(labelText: 'Project name'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, controller.text.trim()), child: const Text('Create')),
        ],
      ),
    );
    if (name == null || name.isEmpty) return;

    try {
      final now = DateTime.now().toUtc().toIso8601String();
      await Supabase.instance.client.from('projects').insert({
        'id': 'project_${DateTime.now().microsecondsSinceEpoch}',
        'user_id': user.id,
        'project_name': name,
        'project_data': {'tracks': [], 'markers': []},
        'aspect_ratio': '16:9',
        'duration_sec': 0,
        'fps': 30,
        'updated_at': now,
      });
      await _loadProjects();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Project could not be saved. Check your Supabase projects table and access policies.')),
      );
    }
  }

  Future<void> _deleteProject(String id) async {
    try {
      await Supabase.instance.client.from('projects').delete().eq('id', id);
      await _loadProjects();
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not delete this project.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _loadProjects,
      child: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Row(
            children: [
              const Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Your cloud projects', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                  SizedBox(height: 5),
                  Text('Projects use the same Supabase account as the website.', style: TextStyle(color: Colors.white60)),
                ]),
              ),
              IconButton.filled(
                onPressed: _createProject,
                icon: const Icon(Icons.add),
                tooltip: 'Create project',
              ),
            ],
          ),
          const SizedBox(height: 18),
          if (_loading) const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator())),
          if (!_loading && _error != null)
            Card(child: Padding(padding: const EdgeInsets.all(18), child: Column(children: [
              const Icon(Icons.cloud_off, size: 36, color: Colors.orangeAccent),
              const SizedBox(height: 10),
              Text(_error!, textAlign: TextAlign.center),
              const SizedBox(height: 12),
              OutlinedButton.icon(onPressed: _loadProjects, icon: const Icon(Icons.refresh), label: const Text('Try again')),
            ]))),
          if (!_loading && _error == null && _projects.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 50),
              child: Column(children: [
                Icon(Icons.video_library_outlined, size: 58, color: Colors.white38),
                SizedBox(height: 14),
                Text('No projects yet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                SizedBox(height: 6),
                Text('Create a project here. It will be saved to your shared cloud account.', textAlign: TextAlign.center, style: TextStyle(color: Colors.white60)),
              ]),
            ),
          ..._projects.map((project) {
            final id = project['id']?.toString() ?? '';
            final title = project['project_name']?.toString() ?? 'Untitled project';
            final ratio = project['aspect_ratio']?.toString() ?? '16:9';
            final updated = project['updated_at']?.toString() ?? '';
            return Card(
              color: const Color(0xFF111827),
              margin: const EdgeInsets.only(bottom: 10),
              child: ListTile(
                leading: Container(
                  width: 54,
                  height: 54,
                  decoration: BoxDecoration(color: const Color(0xFF292044), borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.movie_creation_outlined, color: Color(0xFFC4B5FD)),
                ),
                title: Text(title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text('$ratio • Updated ${updated.isEmpty ? 'recently' : updated.substring(0, 10)}'),
                trailing: PopupMenuButton<String>(
                  onSelected: (value) {
                    if (value == 'delete') _deleteProject(id);
                  },
                  itemBuilder: (_) => const [PopupMenuItem(value: 'delete', child: Text('Delete project'))],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}

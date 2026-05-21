import importlib
mods = [
    'sga.apps.distributivos.models',
    'sga.apps.distributivos.views',
    'sga.apps.distributivos.serializers',
    'sga.apps.distributivos.services',
]
for mod in mods:
    try:
        importlib.import_module(mod)
        print('Imported', mod)
    except Exception as e:
        print('ERROR importing', mod, '->', e)

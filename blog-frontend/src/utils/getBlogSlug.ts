export const getBlogSlug = (search = window.location.search) => {
  // 1. Priorité absolue au paramètre URL (?user=xxx)
  const params = new URLSearchParams(search);
  const userParam = params.get('user');
  if (userParam) return userParam.toLowerCase();

  const hostname = window.location.hostname;

  // 2. Cas Local
  if (hostname === 'localhost') return 'jac';

  // 3. Nouvelle syntaxe : user-blog.helioscope.fr
  // Ex: jac-blog.helioscope.fr -> jac
  const match = hostname.match(/^([a-z0-9-]+)-blog\./i);
  if (match && match[1]) {
    return match[1].toLowerCase();
  }

  // 4. Domaine principal : blog.helioscope.fr (sans préfixe utilisateur)
  // On peut choisir d'afficher une liste ou l'utilisateur par défaut (jac)
  if (hostname.startsWith('blog.')) {
    return 'jac'; // Valeur par défaut
  }

  // Fallback
  return 'jac';
};

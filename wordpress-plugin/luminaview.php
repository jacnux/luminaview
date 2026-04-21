<?php
/*
Plugin Name: LuxVue Integration
Description: Intègre les galeries Hélioscope dans WordPress via Shortcode.
Version: 1.6
Author: LuxVue Team
*/

if ( ! defined( 'ABSPATH' ) ) { exit; }

// --- CONFIGURATION ---
// Changez ceci par votre vrai nom de domaine principal
// (Le plugin gérera automatiquement le slash final, avec ou sans)
//define('LUMINAVIEW_FRONTEND_URL', 'http://localhost:3001');

// Ligne à activer quand on sera sur serveur
// define('LUMINAVIEW_FRONTEND_URL', 'https://votredomaine.com');
//define('LUMINAVIEW_FRONTEND_URL', 'http://195.154.114.124:3001');
define('LUMINAVIEW_FRONTEND_URL', 'http://localhost');
// --- 1. ENREGISTREMENT DES RÉGLAGES ---
add_action('admin_init', 'luminaview_register_settings');

function luminaview_register_settings() {
    register_setting('luminaview_settings_group', 'luminaview_default_width');
    register_setting('luminaview_settings_group', 'luminaview_default_height');

    add_settings_section(
        'luminaview_main_section',
        'Dimensions par défaut',
        null,
        'luminaview'
    );

    add_settings_field(
        'luminaview_default_width',
        'Largeur (%)',
        'luminaview_width_render',
        'luminaview',
        'luminaview_main_section'
    );

    add_settings_field(
        'luminaview_default_height',
        'Hauteur (px)',
        'luminaview_height_render',
        'luminaview',
        'luminaview_main_section'
    );
}

function luminaview_width_render() {
    $width = get_option('luminaview_default_width', '100');
    echo '<input type="number" name="luminaview_default_width" value="' . esc_attr($width) . '" class="small-text"> %';
}

function luminaview_height_render() {
    $height = get_option('luminaview_default_height', '600');
    echo '<input type="number" name="luminaview_default_height" value="' . esc_attr($height) . '" class="small-text"> px';
}

// --- 2. SHORTCODE ---

add_shortcode('luminaview', 'luminaview_render_shortcode');

function luminaview_render_shortcode($atts) {
    // Récupération des réglages globaux
    $default_width = get_option('luminaview_default_width', '100');
    $default_height = get_option('luminaview_default_height', '600');

    $atts = shortcode_atts(array(
        'id'        => '',
        'display'   => 'iframe',
        'width'     => $default_width,
        'height'    => $default_height,
        'title'     => 'Voir la galerie',
        'autostart' => 'false',
    ), $atts);

    if (empty($atts['id'])) {
        return '<div style="padding:20px; background:#ffebe8; border:1px solid #c00; color:#c00;">Erreur: L\'attribut ID est manquant.</div>';
    }

    // CORRECTION ICI : On nettoie l'URL pour éviter le double slash (//)
    $app_url = rtrim(LUMINAVIEW_FRONTEND_URL, '/');

    // --- MODE LIEN ---
    if ($atts['display'] === 'link') {
        $target_url = esc_url($app_url . '/album/' . $atts['id']);
        return '<div style="text-align:center; margin: 20px 0;">
            <a href="' . $target_url . '" target="_blank" style="display:inline-block; padding: 12px 24px; background-color:#0073aa; color:#ffffff; text-decoration:none; border-radius:4px; font-weight:bold;">
                ' . esc_html($atts['title']) . ' ↗
            </a>
        </div>';
    }

    // --- MODE SLIDESHOW ---
    if ($atts['display'] === 'slideshow') {
        $h = ($atts['height'] == $default_height) ? '800' : $atts['height'];
        $iframe_url = esc_url($app_url . '/album/' . $atts['id'] . '?mode=slideshow');
        $style = 'width: ' . esc_attr($atts['width']) . '%; height: ' . esc_attr($h) . 'px; border: 1px solid #ddd; background:#000;';
        return '<div style="margin: 20px 0;">
            <iframe src="' . $iframe_url . '" style="' . $style . '" allowfullscreen></iframe>
            <p style="font-size:10px; color:#999; text-align:center; margin-top:5px;">Diaporama LuxVue</p>
        </div>';
    }

    // --- MODE IFRAME NORMAL ---
    $iframe_url = $app_url . '/album/' . $atts['id'] . '?mode=viewer';

    if ($atts['autostart'] === 'true') {
        $iframe_url .= '&autostart=true';
    }

    $iframe_url = esc_url($iframe_url);
    // MODIF V5.0 : Hauteur 100vh (plein écran visuel), fond noir, pas de bordure

    // Hauteur fixe grande + autorise le scroll si besoin
    $style = 'width: ' . esc_attr($atts['width']) . '%; height: 900px; border: none; background: #000; display: block;';
    return '<div style="margin: 20px 0;">
        <iframe src="' . $iframe_url . '" style="' . $style . '" allowfullscreen></iframe>
    </div>';
}

// --- 3. PAGE D'ADMINISTRATION ---

add_action('admin_menu', 'luminaview_add_admin_menu');

function luminaview_add_admin_menu() {
    add_options_page('LuxVue', 'LuxVue', 'manage_options', 'luminaview', 'luminaview_options_page');
}

function luminaview_options_page() {
    ?>
    <div class="wrap">
        <h1>Configuration LuxVue</h1>
        <form method="post" action="options.php">
            <?php
            settings_fields('luminaview_settings_group');
            do_settings_sections('luminaview');
            submit_button();
            ?>
        </form>

        <h2>Informations Système</h2>
        <p>URL du Frontend configurée : <code><?php echo LUMINAVIEW_FRONTEND_URL; ?></code></p>
        <p><em>Pour changer l'adresse, modifiez le fichier du plugin et changez la constante <code>LUMINAVIEW_FRONTEND_URL</code>.</em></p>
    </div>
    <?php
}

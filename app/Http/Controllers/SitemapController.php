<?php

namespace App\Http\Controllers;

use App\Models\LegalPage;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $base = rtrim(config('app.url'), '/');

        $static = [
            ['loc' => $base . '/',          'priority' => '1.0', 'changefreq' => 'weekly'],
            ['loc' => $base . '/#modules',  'priority' => '0.8', 'changefreq' => 'monthly'],
            ['loc' => $base . '/#tarifs',   'priority' => '0.8', 'changefreq' => 'monthly'],
            ['loc' => $base . '/#demo',     'priority' => '0.9', 'changefreq' => 'monthly'],
            ['loc' => $base . '/#faq',      'priority' => '0.7', 'changefreq' => 'weekly'],
            ['loc' => $base . '/#sara',     'priority' => '0.6', 'changefreq' => 'monthly'],
            ['loc' => $base . '/aide',      'priority' => '0.6', 'changefreq' => 'monthly'],
            ['loc' => $base . '/login',     'priority' => '0.5', 'changefreq' => 'yearly'],
            ['loc' => $base . '/register',  'priority' => '0.5', 'changefreq' => 'yearly'],
        ];

        $legalPages = LegalPage::where('is_published', true)
            ->select('slug', 'updated_at')
            ->get()
            ->map(fn($p) => [
                'loc'        => $base . '/legal/' . $p->slug,
                'lastmod'    => $p->updated_at?->toDateString(),
                'priority'   => '0.4',
                'changefreq' => 'yearly',
            ])
            ->toArray();

        $urls = array_merge($static, $legalPages);

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        foreach ($urls as $url) {
            $xml .= "  <url>\n";
            $xml .= "    <loc>{$url['loc']}</loc>\n";
            if (!empty($url['lastmod'])) {
                $xml .= "    <lastmod>{$url['lastmod']}</lastmod>\n";
            }
            $xml .= "    <changefreq>{$url['changefreq']}</changefreq>\n";
            $xml .= "    <priority>{$url['priority']}</priority>\n";
            $xml .= "  </url>\n";
        }

        $xml .= '</urlset>';

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }
}

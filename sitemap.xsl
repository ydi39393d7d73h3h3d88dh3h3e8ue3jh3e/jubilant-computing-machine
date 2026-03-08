<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    
    <xsl:output method="html" encoding="UTF-8" indent="yes"/>
    
    <xsl:template match="/">
        <html>
            <head>
                <title>Sitemap - LuxAutoSpa</title>
                <meta charset="UTF-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <style>
                    body {
                        font-family: 'Inter', Arial, sans-serif;
                        background-color: #0b0b0b;
                        color: #e0e0e0;
                        margin: 0;
                        padding: 30px;
                        line-height: 1.6;
                    }
                    .container {
                        max-width: 1200px;
                        margin: 0 auto;
                        background: #131313;
                        border-radius: 30px;
                        padding: 30px;
                        border: 1px solid #2a2a2a;
                    }
                    h1 {
                        color: #fff;
                        font-size: 2.5rem;
                        margin-bottom: 10px;
                    }
                    h1 span {
                        color: #d4a13e;
                    }
                    .stats {
                        color: #888;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 1px solid #2a2a2a;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th {
                        text-align: left;
                        padding: 15px 10px;
                        background: #1e1e1e;
                        color: #d4a13e;
                        font-weight: 600;
                        border-radius: 10px 10px 0 0;
                    }
                    td {
                        padding: 12px 10px;
                        border-bottom: 1px solid #2a2a2a;
                    }
                    tr:hover td {
                        background: #1a1a1a;
                    }
                    .url {
                        color: #d4a13e;
                        text-decoration: none;
                        font-weight: 500;
                    }
                    .url:hover {
                        text-decoration: underline;
                    }
                    .priority {
                        display: inline-block;
                        padding: 4px 8px;
                        border-radius: 20px;
                        font-size: 0.85rem;
                        font-weight: 600;
                    }
                    .priority-high {
                        background: #d4a13e;
                        color: #0b0b0b;
                    }
                    .priority-medium {
                        background: #2a2a2a;
                        color: #fff;
                    }
                    .priority-low {
                        background: #1e1e1e;
                        color: #888;
                    }
                    .changefreq {
                        color: #888;
                        font-size: 0.9rem;
                    }
                    .lastmod {
                        color: #aaa;
                        font-size: 0.9rem;
                    }
                    .images-count {
                        color: #d4a13e;
                        font-size: 0.9rem;
                    }
                    .footer {
                        margin-top: 30px;
                        text-align: center;
                        color: #666;
                        font-size: 0.9rem;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1><span>LuxAutoSpa</span> Sitemap</h1>
                    <div class="stats">
                        Всего URL: <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>URL</th>
                                <th>Приоритет</th>
                                <th>Частота</th>
                                <th>Последнее изменение</th>
                                <th>Изображения</th>
                            </tr>
                        </thead>
                        <tbody>
                            <xsl:for-each select="sitemap:urlset/sitemap:url">
                                <xsl:sort select="sitemap:priority" order="descending"/>
                                <tr>
                                    <td>
                                        <a href="{sitemap:loc}" class="url" target="_blank">
                                            <xsl:value-of select="substring-after(sitemap:loc, 'https://luxautospa.ru')"/>
                                        </a>
                                    </td>
                                    <td>
                                        <xsl:choose>
                                            <xsl:when test="sitemap:priority > 0.8">
                                                <span class="priority priority-high">
                                                    <xsl:value-of select="sitemap:priority"/>
                                                </span>
                                            </xsl:when>
                                            <xsl:when test="sitemap:priority > 0.5">
                                                <span class="priority priority-medium">
                                                    <xsl:value-of select="sitemap:priority"/>
                                                </span>
                                            </xsl:when>
                                            <xsl:otherwise>
                                                <span class="priority priority-low">
                                                    <xsl:value-of select="sitemap:priority"/>
                                                </span>
                                            </xsl:otherwise>
                                        </xsl:choose>
                                    </td>
                                    <td class="changefreq">
                                        <xsl:value-of select="sitemap:changefreq"/>
                                    </td>
                                    <td class="lastmod">
                                        <xsl:value-of select="substring(sitemap:lastmod, 1, 10)"/>
                                    </td>
                                    <td class="images-count">
                                        <xsl:value-of select="count(image:image)"/>
                                    </td>
                                </tr>
                            </xsl:for-each>
                        </tbody>
                    </table>
                    
                    <div class="footer">
                        © 2026 LuxAutoSpa - Премиальный детейлинг
                    </div>
                </div>
            </body>
        </html>
    </xsl:template>
    
</xsl:stylesheet>
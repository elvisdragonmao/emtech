<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" encoding="UTF-8" indent="yes" />
    <xsl:template match="/">
        <html>
            <head>
                <title>
                    <xsl:value-of select="rss/channel/title" />
                </title>
                <style>
                    body {
                    font-family: system-ui, Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f2f4f8;
                    color: #363636;
                    }
                    h2{
                        text-align: center;
                        font-size: 1.2rem;
                    }
                    .container {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                    padding: 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                    }
                    .post {
                    background-color: #ffffff;
                    border: solid 1px #dae1f8;
                    border-radius: 1.875rem;
                    padding: 1.5rem;
                    padding-bottom: 2rem;
                    position: relative;
                    }
                    .post h3 {
                    font-size: 18px;
                    margin: 0 0 10px;
                    }
                    .post p {
                    margin: 0 0 20px;
                    color: #555;
                    }
                    .post a {
                    color: #8b9bcc;
                    text-decoration: none;
                    }
                    .post a:hover {
                    text-decoration: underline;
                    }
                    .pub-date {
                    font-size: 12px;
                    color: #999;
                    position: absolute;
                    bottom: 0px;
                    left: 1.5rem;
                    }
                </style>
            </head>
            <body>
                <h1 style="text-align:center;">
                    <xsl:value-of select="rss/channel/title" />
                </h1>
                <h2>看來是個不想被演算法操控的朋友呢~<br />歡迎提交這個網址給你習慣的 RSS 閱讀器喔！</h2>
                <div class="container">
                    <xsl:for-each select="rss/channel/item">
                        <div class="post">
                            <h3>
                                <a href="{link}">
                                    <xsl:value-of select="title" />
                                </a>
                            </h3>
                            <p>
                                <xsl:value-of select="description" />
                            </p>
                            <p class="pub-date"> Published: <xsl:value-of select="pubDate" />
                            </p>
                        </div>
                    </xsl:for-each>
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
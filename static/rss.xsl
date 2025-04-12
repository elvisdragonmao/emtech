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
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #F2F4F8;
                    color: #363636;
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
                    border: 1px #d2dee6 solid;
                    border-radius: 1.875rem;
                    padding: 1.5rem;
                    box-shadow: 0 8px 16px -4px #2c2d3005;
                    }
                    .post h3 {
                    font-size: 18px;
                    margin: 0 0 10px;
                    }
                    .post p {
                    margin: 0 0 10px;
                    color: #555;
                    }
                    .description{
                    flex: 1;
                    }
                    .post a {
                    color: #007bff;
                    text-decoration: none;
                    }
                    .post a:hover {
                    text-decoration: underline;
                    }
                    .pub-date {
                    font-size: 12px;
                    color: #999;
                    }
                    h1{
                    margin-top: 64px;
                    }
                    h1+p{
                    text-align: center;
                    }
                </style>
            </head>
            <body>
                <h1 style="text-align:center;">
                    <xsl:value-of select="rss/channel/title" />
                </h1>
                <p>看來是個不喜歡被演算法控制的朋友呢w<br />歡迎將這個網址加入你的 RSS 閱讀器喔！<br />(一個月內的貼文會保留全文)</p>
                <div class="container">
                    <xsl:for-each select="rss/channel/item">
                        <div class="post">
                            <h3>
                                <a href="{link}">
                                    <xsl:value-of select="title" />
                                </a>
                            </h3>
                            <p class="pub-date">
                                <xsl:variable name="pub" select="pubDate" />
                                <xsl:variable name="day" select="substring($pub, 6, 2)" />
                                <xsl:variable name="monthText" select="substring($pub, 9, 3)" />
                                <xsl:variable name="year" select="substring($pub, 13, 4)" />

                                <!-- 月份英文轉數字 -->
                                <xsl:variable name="month">
                                    <xsl:choose>
                                        <xsl:when test="$monthText = 'Jan'">01</xsl:when>
                                        <xsl:when test="$monthText = 'Feb'">02</xsl:when>
                                        <xsl:when test="$monthText = 'Mar'">03</xsl:when>
                                        <xsl:when test="$monthText = 'Apr'">04</xsl:when>
                                        <xsl:when test="$monthText = 'May'">05</xsl:when>
                                        <xsl:when test="$monthText = 'Jun'">06</xsl:when>
                                        <xsl:when test="$monthText = 'Jul'">07</xsl:when>
                                        <xsl:when test="$monthText = 'Aug'">08</xsl:when>
                                        <xsl:when test="$monthText = 'Sep'">09</xsl:when>
                                        <xsl:when test="$monthText = 'Oct'">10</xsl:when>
                                        <xsl:when test="$monthText = 'Nov'">11</xsl:when>
                                        <xsl:when test="$monthText = 'Dec'">12</xsl:when>
                                    </xsl:choose>
                                </xsl:variable>

                                <xsl:value-of select="concat($year, '/', $month, '/', $day)" />
                            </p>
                            <p class="description">
                                <xsl:value-of select="description" />
                            </p>
                        </div>
                    </xsl:for-each>
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
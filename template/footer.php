<footer class="text-center text-white">
    <div class="mb-3">
        copyright &copy; 2024 Design by INX tnESH.cop<br>
        <br>( 本系統螢幕解析度建議：1920 x 1080 dpi，低於此解析度將會影響操作體驗 )
        <!-- <br>system owner：陳建良 (42117)  -->
    </div>
    <div id="debug">
        <?php if(isset($_REQUEST["debug"])){
            echo "<div class='text-start text-white'><pre>";
                if(isset($_SESSION["AUTH"])){
                    echo "AUTH：";
                    print_r($_SESSION["AUTH"]);
                }
                if(isset($_SESSION[$sys_id])){
                    echo "{$sys_id}：";
                    print_r($_SESSION[$sys_id]);
                }
            echo "</pre></div>";
        } ?>
    </div>
</footer>

</body><!-- 防止 ERR_CACHE_MISS -->
<script>window.history.replaceState(null, null, window.location.href);</script>
</html>
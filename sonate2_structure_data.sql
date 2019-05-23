CREATE DATABASE  IF NOT EXISTS `sonate2` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `sonate2`;
-- MySQL dump 10.13  Distrib 5.7.17, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: sonate2
-- ------------------------------------------------------
-- Server version	5.7.18-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `chat`
--

DROP TABLE IF EXISTS `chat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat`
--

LOCK TABLES `chat` WRITE;
/*!40000 ALTER TABLE `chat` DISABLE KEYS */;
INSERT INTO `chat` VALUES (1,'Alice,Bob,Charlie'),(2,'Bob&Charlie');
/*!40000 ALTER TABLE `chat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_key`
--

DROP TABLE IF EXISTS `chat_key`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chat_key` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `chatId` int(11) NOT NULL,
  PRIMARY KEY (`id`,`chatId`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_key`
--

LOCK TABLES `chat_key` WRITE;
/*!40000 ALTER TABLE `chat_key` DISABLE KEYS */;
INSERT INTO `chat_key` VALUES (1,1),(2,1),(3,1),(4,1),(5,1),(6,1),(7,1),(8,2);
/*!40000 ALTER TABLE `chat_key` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_participant`
--

DROP TABLE IF EXISTS `chat_participant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chat_participant` (
  `chatId` int(11) NOT NULL,
  `participantId` int(11) NOT NULL,
  PRIMARY KEY (`chatId`,`participantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_participant`
--

LOCK TABLES `chat_participant` WRITE;
/*!40000 ALTER TABLE `chat_participant` DISABLE KEYS */;
INSERT INTO `chat_participant` VALUES (-1,1),(1,1),(1,2),(1,3),(2,2),(2,3);
/*!40000 ALTER TABLE `chat_participant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message`
--

DROP TABLE IF EXISTS `message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `message` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `content` blob,
  `salt` blob,
  `time` datetime DEFAULT NULL,
  `chatId` int(11) NOT NULL,
  `chatKeyId` int(11) NOT NULL,
  `senderId` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message`
--

LOCK TABLES `message` WRITE;
/*!40000 ALTER TABLE `message` DISABLE KEYS */;
INSERT INTO `message` VALUES (1,'Ý>À¡~|¶íã_Û)\0Î4èKgLó	¡(Qº¤i\r','{Äxý#äúÒ*Â¨,7','2018-03-19 10:14:09',1,1,1),(2,'\nvx\\´*ïy´«Þ?«6','ØAJ)Ñ¦3÷Q¿ªG\0','2018-03-19 10:14:26',1,1,2),(3,'X§÷´E²\\a3p','q7¥[PIc8`äÇÍ','2018-03-19 10:15:17',1,1,3),(4,'®*ý;£hû¸r_¿ lµ¤/®GËCiÿõ«MuÃÕkHµ²é\Zî¢Ø','¥e-6fU³ã#¿b','2018-03-19 10:15:44',1,5,1),(5,'ïL(½EØ\0ÔP]pìm\0W´^}_-§ÃZ','2Ýÿ?gäÃª¢¾qÛ×','2018-03-19 10:15:55',1,5,2),(6,'³\n®0\'ç®\'e(H¸Rì¼õ','½÷NÌI\n5§¯ß)ï6+','2018-03-19 10:16:16',1,6,2),(7,'ùøºº8²åHà1u¦','Ú2+mâ(J§Åò	Û&£','2018-03-19 10:16:35',1,7,3),(8,'$@þÝK/l¶0»,i','ëÌ/>\"úüg~g','2018-03-19 10:17:10',2,8,2),(9,'³ÅúáWRÈÒóÉÒ²Ê¹','t;ûÔÌG°½ô«¬ð','2018-03-19 10:17:16',2,8,3);
/*!40000 ALTER TABLE `message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_chat_key`
--

DROP TABLE IF EXISTS `personal_chat_key`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `personal_chat_key` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `chatKeyId` int(11) NOT NULL,
  `chatKey` blob,
  `salt` blob,
  `userId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`,`chatKeyId`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_chat_key`
--

LOCK TABLES `personal_chat_key` WRITE;
/*!40000 ALTER TABLE `personal_chat_key` DISABLE KEYS */;
INSERT INTO `personal_chat_key` VALUES (1,1,'b=R­ Çî²*.Þ³¿ÎæNÑzdu	b0ZM^zF÷íÍ(ï¥x^rx?\r¡ÿ3ò\0ë[ïËËÊ@DIünÕèGY³\rw=.ÜÀ\\¾\ngã»üvP0\'µ2ÿ·Á¢[7çùðíÁªwÄ°¸SIóÔ(u¿;69ÅhãVôr´dþFkdS6Èuz<:í\'ÂÝ\nlgÈ\0Kð²\Z\n\'9£úÒF¥¯²ÂèGY)\Z50õNÁãâê9*\\éÇN×æ¦+TlY\0ÁFïDBÊ½²Ö~','±/;ÃWIÕUå;âþ;R',2),(2,1,'HÑ\\Úäç¬ánÜ²¿ó|ÙÇjNëeñòò\"%èw\nþvïUÞy?¬-\"`8¿%ñoýÌäv·f%KÛ{¦;ç¹<å´·ÕCÂ*ËÑ\rûÉóëJé{!ÞÿÛIæÝiy-¨ÒTâ MOF&³o{g»@ü\0¼§­Î½SúÖvmÁàå4\'§ßuÕ<p¡ôIÏä¿íSîògÜ^)ÄR~®:\\«Ó(.J û¼øD×L-!þ­»+~;Sªè\\Éaw®éAOðë:M¶©áïãÍøy\nÛlf','c7Ô²ÇU\nÅiÛK¥fIÂ',3),(3,1,'&[Ì5¸ðKCùRwuåá^£^}47ºÙä{¨­8øíuhr¾´Y9ÛÝH>Õ!ªÿ+=h×JÎíhFÿAÛ¶äø_¸ìx ÈëáûvÙcíSýEÓ÷níð¡)ü-æïòËÿnX	÷+U ëá»\n5Á|:¶rßVçà6Ì¾a3:¤.ß×¹ÅwrÇÉä]Âê¿<`¢Ä°@ÅI#2³RóX`Ü6x½ix^â¢ÍBÈPkÈeºÝukª~Á_©J§÷ß¢õl4\'Ã*ì!Ú«>.¤l7Eó','3½öÙf!M{­Þxu\n',1),(4,2,'pfqt\Z kã¶\Z¼sA=Ñv]¤î5,ê\"ðÞ\'%xén)á~Í12áãÆM;Ïÿ|Ìó\"$ôÏá\r®´Æ^¨éø Mg´%\"MßJâAßGB«j°W¾ô=ZIî£G6åSÚ+»ò4¯À7÷Ò!kÒÀ@\Z¼ÝMÒ±.R\"!+: ~®þèÀÜzïJ+Àü»¿á6ÚàVÏX\"K ²x×MEßç\\@ÆÝ\' ãXAMi]Ýå³¾Lïx4cQÎ`æqL~#ÊGó ä:\\ÔàQu¦vÈV´jQÚ,¶^@','.¬;>øÿNçéî§',1),(5,2,'Ë´»3*@ÒAa~¼/*áÝD¦ÚèKÓfzóEf&mS!qÃ_è=M×÷	7Ón\ZT¸j4Ok¬÷]ô3³þ)&kÉVp*æO0E±@ÕÆR2AbwikS±HÝ/´lÈÏ¨Ò3w^Ós~*Mëçe8Å\"qSÉëêìßQõ/ÌÎÕþÉØÊúâ^zÿ8?}ÓjæÜOèqòÜù¢ÁÌGmÉ´¶j8C,ûú·Z-$\\Ù<®»ÜOÍO©f\réª)EEø\'>D£Z¶gåÏ²%;mkçB¢TÞ½æc)','Js°°¾XLÁËîO;ì/fª',2),(6,2,'aLN§YyIõ\nÁnÎY!àu¸íÒp¨ì& ô\Zè!é-¢ÎTïðì<¨p#¢]eïq¥c¹åj\ZÖ%ÞQ®(ÌuD_iØCôZ!áv%1N»ÊÑ\\dî3¥}·-£ÆEZZ¨)û\nøþ&¿A%5\'	m<9Qc[K7GÀ.ç ¡>Ù·¶±çM)ü\Z¶*ÚÖ<¿Vý_UÍ¹\'_©1qÑ²!!¹#Aµ¸¼_ìÉ\0Zõõ~aùÃ/:n¢L,SÿÀÂ¸ïÓ+C\'².Ögs¶l$E¦','VÐaóø<zäù£5´}',1),(7,3,'¨¥:©Á î«æÉJ¦áÞr¡¢AÕò!à¸&)Ý+!Â*7DîY ß;V ìÕ©g{:pÅ(PµkØuq]DmÕeÔ+üÑ\0ûÇ/q\'â©Ø®@!7EM) ;©¼djð\ZtPÝê2Ëù7Ú	í}@ûyVG±~÷e¼ù4®ÊbêÅ¼%ôÎCçØ)+^sTH×_ÿ<A·¡ÝëDCãzøTo®ß$lëHh{XZðá9÷+=É÷@l£{¶¼Cîn±õª¶é	O5Ö@hé~i{[Ô OT#ÄU','¾OGùÀ~.H9+',1),(8,3,'eÑ~ðââw\n»+L\'æmN½Ï4!yÍÌ µ{·}OKÁBß¶f¹1ó¢ñýäR£aÆ|eø¦üPVJ/Â>Ì2ª[ªEº]åKÔMXä£à¢X¢+÷Uj­¬F?¤Ø7Äaõú;åh³¸{?c[h@pgðíÓÑR¿$ö*éc}<t¨»\"o©pØøcò¼ËÏvû¨¨\rkRÍ+Q·âptâÚº$¼º£þÂÜ,¨j¹\086¼³¼½Qï¿^ÜÝ.±M&ùÉ°ùýpâ®¥ßh¢ÊIÙD´\"÷v','yÇ_k~\0Ý¾Wÿ³',2),(9,3,'müVªUÛÕ0­}5\nïe1[2Gw@|_óìEjÒöÌøøE+õO/f´éÔÂ	æ#\'lÚÀ2ýð=AÜìi\Z²UËIÞvéÚ\Z?AñdUýmÆ«JY¾­ÖOl.¨Á§VCÌop:Å6 C\\^$¬¬iDÈâ&â2nc3\r<£dÕuG-f~ÒáÔÁÕ-¸é´4qÑ¨ø¾BR£;<ÕkÖ5ü¯l±é­]ó[Õdp±Â&èÞìl^ßé?ÙZèÚÙ¹ÕÓ$Õ²øÛè4ë·S×ub*¬ß!á\0','%å¨!µ:Chbþ+^H',2),(10,4,'/Ò0½¨Ï$¶w.xbÀ¿hÊÝM­ôTç ¶z¹Ü3£Pï:6.Ø[½\nÒuØ¡ÿÿ¡HgöÛÎI)]ÃóÃØdZ>(Tõ7\ZÚ;Wb¾¨gs¡Õìï¹ôJUdÁÆÉú%8Í+.D;ÏqÓußwE&Ò@ýz¦rJ×N\r(zªNIÒÐäz¼¥.ðt,äühl|z©¥SÀ>:Seß­Hµog²ükEöñz}äxÚ/ ¬EÈf(þNûm´ø.6ºdÄ0|´/ 0àq¿ÿy¹àBL#¿Bð­&:0¹ú\ZUSGýûð','ñÎh `N}A5×ËÓj',1),(11,5,'\"½\"päÔ\nô]Xq\"äï§QùñÓirSV&fÇdÇs\0º*ÈÇá-baô8ÜãV¿C$°Îiã	ë®ZäitªphÚ WNháEð£l¹=÷`J§7¿-;v\0G°KÜ`¦ãß¿ùnhÄQü£ï!îÃµ¬¶ç-þÝõì­§\0ÅðG9Öc4-²4s®\'ëæEÿÍç¶\'CY~dõÈ$F£¼¯.ovô¿0ì<ÕN²Éÿ1`gñ­Jñ\'^\Zì:¯ÀáQ¥Ç¦\",@ë}ø¾Â²0£Ä¥\\¬¼','ü^Ñ	[ñÙÃ+30Ù',1),(12,5,'\Z÷¦=@½ÉtÄ¦-¦vi-¬öÈ\Zý=«8~0MÏ¿¼Ç¬óY)Ý^«°­4ô¸0gþUôS½}	­DÌò7T¬üÇÑ«]¥ú >´¸w8<\0ùóµr÷4ÀH½p%kãÑÜÑ¦44	üóò.QXWs­æBÜLî´qPIÛÀl¼ÅéÉô\\Ï##s±Ù_Ä®ùË³	5åzàðá±«ÙàPÑ~ÃdÑ/bG°^ï¶ÝÜ£¹ä¡®ë\n>iskjAá}jxècðE2¥¡1<<>','£ËÂj-$ìbtÌªv',2),(13,5,'¯·pïc·&nèb½âÙê!Á?so#¤Káî±~xbl½HôTáïº\\¡6Ùp¾RÐ#Ë±Óßm,-Ã¡Ût[¹½6Çó9Éý½b©ÿ^v&H¾D§ ËòÅ+bï³eó³Õßâ;wAHT¡Q<\n0;Ù÷/ÊaÐ ðø>^3\"n*èÆêü¼¸õO\nÍ\"áFDt¾qõPp´ÿ®ó\n)+Np&çî1-½½æýj3¡ÝÃ¢boèT\' NèÛ7æÀ/Ë2_qn	4òï^ë5\'hàBl\'1:-³',',Wç¤¤ê³n¶',1),(14,4,'Z?Ø+	iî³[ B¡- yÞ`Mf©{ÝxëÓZuÀN¶ß¹v1x¬Ì_LhÌ>\\px=ÿ¨ð?ê=RÍn3¿h±ÍAT¡ona²6Ñµs	?8D]jüûÇ&w:°Mì®èé~|g~ø=âE°ðw¤¢/%kwï­|ÊyaDùc³¥c}7$&£óSr	ÎZÁ\\\0ëPNjêÀfÄâÁÞ®ÛÚ#-x®)d3Ìp\r cPá]ª3V¿f\0hâ]>!(f[\\W°æl=åéewýÉe=Þÿ\ZrûÜ¤kQÅ@û ','\ZCxÓiûÓC­Ì°1kï',2),(15,4,'\rÿýßèsRÕíÒ½ôåÅÔ\0\'T¡óQXâ;U0ß2Ä\"äÒOD¹È|MxiµJ©á³ÄFØX\Zñ(=ÎÚD!\'\"!©\n·8ëòNlÍ¯xÃðesòZÈÙ4ÿK4âÝ{Yé@$£é#ÌYÛ-ÌÕßâð\r±·!ô\\;ÚM»y¿¸®ì0ó`A^÷.êªÆ%,#q=I¿nxüÞ¦¹7áíÚ±;aÇùD7åÄØu±ú¨ü}è~ÅcÈDÇÓ¨Ên¾éhEv¬_é¶aYpV¼\Z­t\ZéÞ','ÍeÍÂwY\\[ólïÁ9Å',2),(16,6,'®x¢`C§ÕØoAîPp§ú¶Ñ~ç<HÕßYKL\0Äm\"Kj/gÓ~¿áyvÆ\\ÀõhØ~³¨?E-ÙæÙ.Îõíÿ5¨WvëÞjØ$0~VÿeÌ÷DºðöééüÀ+QíHzúÐßrrøÇBCz§h£hÁ8\ZÞwü¡=\'/£%Ù%	þä\"½kía[,>ÛñÏGÙD¥@ßË®Ìoû¢5®RZA6ÀB\r%{%S\rgpÎ3Ö1T1÷à+°~d¡#ó[ÁËOçîB°¼[X8ÌÄo+c*Ý8ÔCh	©}k','I)ºQ¨ìÑ2p½ÂÆ',1),(17,6,'|ø|{qzÊÜp0üýAû\n0ïÍ9Åèc÷f	jÃìLØßìO£`ß^Ç»\"rX~×ëÆ,Ûa©V~¿{ì=hN\"ùÍLo&T¼bÓ°ÛëJnyl6ÔÒ$å¾ì¾\0kh1AGõ¦(Õ¢\'©wg 01UE>5ç1g[\"qç~dhêYX °æàã0	¸m÷K¢Â=ø]r¿e!±qFÄkÌæGOìþsjO!³¹H·¬±XBÍºw©#{=)ïö=¯îýF¿íÎAdÅwàlí»ÃUm¶ÜUU] ²âÍkZ[+ïÅxùõ','Î¶^7îDÄÂÁD\\',2),(18,6,'[¹uS@½	\ro¿aðBíPW¡ÎYvÄJÙuó2èápÄr¤Vècô°±{·rßY§çYX~ÕO[ñÃqäÔóI&vìüÎ2Õñ8½l-÷\rz,ó>+D+O­pXvm?§³ÃÈ\\Ða6WÈvÝÝêÑeúÛd·\ZvLÖ}ã>¥»\"ß7#ù¹Ö×ÎBÝN5u«\\~¢\ro?õkÌ¾¤T¹ÜÔïøò{©Mjw\'GP`ÒfVZé§®ú:så&õNWç(½)únß)LØé]Ôz*×nXï*G\\°tÎyIËCÕJ','LMÒjjRÓ1ghI+',2),(19,6,' Çñú4!© ¬\"L|(Òó##,	ÒiÍy!«D`hËYúñT{5Ïòpb0ÛÀÃ?vá+*ýÝPêrýè5ú3Ò1gÁYØðÑÆe0©¨K1ß\\¸ºÖq¹®¾QõgZÍ\rÁÆþ«×¨n8{Ý¨£XE÷AÕGèGÑýLÑ/õbÄ²°JãAÙ¥Ñ$ûÝ§BÏ$þÒ:÷(Ò×Sð9Â¬0u¤»\'Yé|[½ô~VfÓSÈbVêaÃH¡ÅB«:ôÜÛ¤~\Z÷û{Y¼-Ú7»pú|q>¥2CfuÖ¥Ç!Æ','»îU,~)Ôi#r@OOñ',3),(20,6,';W óBÅ^UMäà!²ÁìÇõ-ã0ÇÏ#»â\nÂÒDì¾õK®	8|ÿ»y5öÜ·5D ÃÖyæ9\Z÷(>dÓ\r!fÄã®ÙùÜv3*3,j/3\ZôÐ_gÔÇ¹ñC¥Û·èNJFªç6Sí[Úú[y£ÇY\'s¸ÃÀÿ.È}*V0Df/ÉDO´eDYõ~*Ýio\0ÝôÛ º>·¬j[<ì?I<ÛµÝ¦RZ#opÊRóÜ·Bjóå£slo%p¥\'\" ×pÓf|4R','÷gs®ô1±ûÁ6Wö£',2),(21,7,'Ì!Bù÷Ü&ÓÄâO`É;m®5ðD@Pø¹iãÄýÓÐw¾é³¿Eô¦ÜóÖLÂ	[4BxÚÐ\0Hí,SË­¤RìØEc¬}}µ£ð^\rûNÁ&®)±æÊ®é­ÕPÔ_)ÔaSøé«|6[úÄ¬²ÎÞMã²¨e}Ps²¤e/ª#w&¿åqGäÌ´HmUlyµoü.y}Má`/þ`SÏ©8sgÏ;1Zj9ï_íì?&îFZ7	[ZÔ=X*=Í½Ã¿#[cr³@oD±','æëËÈÈÔÝè \Z¦²Ã¥',1),(22,7,'¼DñÅkÚ MOaiâØúøôk#E`,ëãIG[¥YÂËrø£ÔªÉýSRÅrDu×¼È¿Ü½(ªà\r)hUo=Ü;±´M¶ÙM§êéã!/0G¹ld§@W³	´¯ÂD^ÚáÜ÷ãôº¶xD°Iåäê©@+sb_+Eðµx~Ì!xàhÞ½ÅøLêÙkü6ÜÈ¶ë£ÕDÕbí  ¯\n5©ò¢M\"µ!e%µU3`&0Ëb\\q×bÇi¤êÈán@~°°¯Ñv9ç\\ÇU¶¾ÈkÆ:iÖßÐ½{÷®ò¼','½*Ê,ìÞ>~SÇnÜa[ú',2),(23,7,'}ã°G#ÖõAçÙ7Í\rõ{ÖÞª²Ñù¥4tµX¸UQ9iÞ«)ßÞÚ9%OõHýdç¢có¸f°J$3­¬Ú`^ÇÉëÌô/M@¼¤°ô$´õÀÔÊ9 ä+)¡Äð²{Fè:y0Ã\n|ëg<ØâØJcQñ]®b:wú|¤=sKz¶1µìõ¯BÜ	,¾ëÉÈ5Ä(ÿ=Ú6I²ùíq`	Ìg\0,Ä(y´`cüðJUÍÀ¸ü *#ÒÞHµUâ|Fì/¹ÔõçÁn1ªtn6¾«ÿ\nV¬õý','ñâPw2ÜAoÜ`âý',3),(24,8,'2	W¸ÜÂÑW	]t#`þô#äEÝèåHiÉþµçñÆ\r`Õèú#ÚÅÐi¤pZPFFOKÆâþ³V æ&QÉA õ\"¤ ò¸1úü\\\"4ÿ y}z5)7f\r3	5\r`2LÄ~è(uigYúµÄð¨Í~ÛbÜµ¯[;·Þ#ßT¦~XsD§=QÈÅL«WËÈj·\'6®)ö37ÏN,A¡OTæ§7d;6tdmpu¯\"¶Õ¿]Ë9rª9a¬ê*ÆË@ÞßÅù»	a¸7Ñëêz.','5åo¥GÄBô/0ª}7',3),(25,8,'1óg8É\naï¸koÝÐ.	îB=X~÷»pyIê6«ï´´Ë²ÿV¼2ç@·7Øaå+µ[æÛ6NÿB3¡¯DM²X­uû°ÊÄD\\ØEdãJ¹¼ÏAiHñ·¦j µ\rÍÅá$¢Sc1±q	aëì<,e]¿\n!õÈYa«Àÿ½N$´vocaB}±ÏvWNìH¨TÒ¿Ô-,³¢ºè0Û^{J=u»x>e\nÏ	ÛÆ+=]:ù0 êÍ¢Ä\'÷É¸5b~ýP\"ª@»cì¢È6QëÃ','[{KÞªh¨GàØ·)LÛ',2);
/*!40000 ALTER TABLE `personal_chat_key` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_message`
--

DROP TABLE IF EXISTS `system_message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `system_message` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `content` blob,
  `salt` blob,
  `time` datetime DEFAULT NULL,
  `chatId` int(11) NOT NULL,
  `chatKeyId` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_message`
--

LOCK TABLES `system_message` WRITE;
/*!40000 ALTER TABLE `system_message` DISABLE KEYS */;
INSERT INTO `system_message` VALUES (1,'ýdî¡-e ±Péµ`(\0hñA*ðØu2bR!ö/ñÏ¹WÑôßÚKZ()0°\nûÀ!','DÜHè³gIÄçF-Ø`°','2018-03-19 10:13:58',1,1),(2,'htÍj\n¸ôtrÔ<	Dö±¸zË×4hÒMgM©­yñ\\{¶h6p','¹DÆ|ÙÕ;¾¬\r©¿0×¡','2018-03-19 10:15:27',1,1),(3,'¸ ²|,÷°¿ÚÚ¹·ÛÂ]ÌìI§§¥ûÔ½^=ûxS`7P:âïénþÐDîÿ­-¬½	ëñ\'','Å&ÿFè¹6P\n\0@âæ','2018-03-19 10:15:27',1,2),(4,'¤G½±&fÅÃÛEîÛ:ãìKK*¸Z¢ØQ\Z÷i?e+­éwÒ¨Ø¤^îÂeÃñË,ñ¿&è','ôã¸»·µ°n·úÝÓP÷8','2018-03-19 10:15:27',1,3),(5,'òwdF/OgÓ	N¾Uñÿ(¶ÆkgïðfðVë\"¸ÓVäÆê0\\ó:t¹nÑ7Óø*[ò\'ÀL]|','\"^ÚâìÌ¶.ñ','2018-03-19 10:15:28',1,5),(6,'5J1Þ	\nâ¢@ÄÖq¿Ùº¾åìþÐy¬Ñ%üø#õ¶?únð»1ècÃOßAMlÂè¥','-î1½ûmÝ\Z Õ7rÝ','2018-03-19 10:15:28',1,4),(7,' 3åI¸^|Ods-}±Õ­¦®[;&ò\'\0×(Yà9Fq[\röiêeô»®dÞë§=ÚÖ\nÖk!fÞ¾','­,XMÊÝ)þ \\;«V;','2018-03-19 10:15:58',1,6),(8,'É2¬gõB&\n²Ä§Aä¤äíH±Ò	ÿ«µJ¶Ó´Xßäâ0¹«v,;ó','/siD<,ùEÕóC','2018-03-19 10:16:29',1,7),(9,'CÌ63ý7«%29Lùm, ã	ªp¬Z·q´Y:Ä@e»«J¸P^¶?÷ç[èt=^±0 °4','wcÌZÈ³Ûç ¬ß]þnÍ','2018-03-19 10:17:05',2,8);
/*!40000 ALTER TABLE `system_message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `publicKey` blob,
  `password` blob,
  `passwordSalt` blob,
  `keySalt` blob,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Alice','{\"alg\":\"RSA-OAEP-512\",\"e\":\"AQAB\",\"ext\":true,\"key_ops\":[\"encrypt\"],\"kty\":\"RSA\",\"n\":\"2fV0y8wUkwlPWM2CQJexXe4m3_yDh2rSU76Q2mUxs_xEqcxUlm50oA1h3z6RlWvOJ0Bkot0yUDkKvdBlv618a-0B4nMiDgo9pwa2lxe0SRoU1mIGLhpofwqR0vODBj-5sNRq2xtqYdc2QNbodYzKxZjvqsU7wRpdDuxwtVD-UGUQgYWNLGiuQy1K0NplLLHC9tKs1XY2pJkV_gyHJBSI7DIF5KsanKKDZEOpL_noL6DQDqMzMJLcSGjN-xDFQSOQpbH36E86IzVdbJZWjlrd_W67INANhw8G5XIowXa8FH1uMjAw1H7ws6LN4io_X78mIzpzE1xTtEBjGv6ZpTaiKQ\"}','~#©öO?~´j6Ô{WaD¢ÅgÇ[/k/2t*ìGGË²¿´ºàt¶ÔÆ-@Ùw','hth[¿#j<qÝ;t0.±)<YRþ\'0AgìºeTÚä¾ÊÎ:ñ	©kg¥TÑ®Y@®=¸J<{$uËâcàÌ}×=|÷³bÂl/´%:7`aaµ4|à\nfOg0Ê;jé´&.\"ò5.5¬iÜ/¹Ñªösö!Ñ,·O©wö4°ªLBÕÁÊéZ¥µ$9jñtWdc}{UÊW!Dcpxvb8\" ÇÁh;Ü5	ø\'Ö&ýÿWþû`Ý¯ë6{DßNð!K_!7$=I¤¯¾òÈ+õ0*','B;ì²î^Æ©#Ê¯0|rmjÝÜÏUã¡ÉÂEG#NNGî!½³µ$âÅ\Z(¬\'°ì6üC§jn±}óòqò¾LîVÔ@\r!\Z&òx¼O·Óg¡Yù¡}ØØ\nªÃh,©,CëÌÃFJ^W¸ïx\n£7»J·s\nEßUF6ICxnhÿäàgU	JÝÙzke]%ê®ñqÁS°\rlT]öiL ÄDT»Cë¥÷©P¿p½mÓØy«äH¬mÞÈ©ýÁ_BÃïjxµJs\n$/âõá~ëÏ¡bÊ&O[&»¤Ì'),(2,'Bob','{\"alg\":\"RSA-OAEP-512\",\"e\":\"AQAB\",\"ext\":true,\"key_ops\":[\"encrypt\"],\"kty\":\"RSA\",\"n\":\"z3CZYc5JeA7y6z6neyu0xV7ZPrnan-pibL8_JqVjBy3can_ES7MRl1w1E2ct95RVqk6Z-lq4wyM3b7i02Nwn3dJWckDHLFTqSL7GoCEBNVks6pqTLnjJ52k_5jmxUJUFNjeeWdYS63Dm6rgH4kgEStAA3gK6bBN6S7mjQoFiJ-ryayh9v356a1uo6NWNoGJk3Pc38URUrUPfURT23Ns9dqBwObKLFVTvt_d66DXXg7xREGJFsv4SSXrwp6Ofte5G9BEOs9hI3xhYHH1XeVCKcZ7BoGjiIOISDCN6fg_OxwR1kE6cwVhsxxPp3u4TXrziOS446d_h7CEs260G1EiCew\"}','`ÃgPã7ÓÝa¥öS¥EÍ*øËÐ`¥^?ÞËZ¨@ý«ÏdÛÂe¶>Ëñvðü¾ËnX','>\\ä¸ åÄY\r«¢ãþ¨D_¬ux÷½îCMèJÇ¨%9æØäáÝãó£¿N?@ákàAÛ)½å°Û©@ê3;1Ü|sa.áel¶FÐÀe\0Nuö^Xt©â,¡ÝØn8Ú? KOd¾ÙOÄß&ý2¸!¸Bk&Õ²¶¢fbÒj¯6«v¥b(=vï?TR¸TtÃÌtT!Wë¨yÛfxÃjÅhr¹A´XËï³ì33çÕé`uÒmªø(1?±âù«D[37ClcÿõñióS1a!â+Ã','a!¾ÖÌ4/bÛZrpRµõÂa\Z@äc<K|³±Ô´]Â]øÐI²ÿÖ¸13$AlË¨k  H¸¿§bÔ\rH^Ø=#Ó\'àMhË¶õ÷£q&)fHëkÁ!R°Ë¨ ºþl áOçCÜÄ­²ç;Uþ¯Õµ¾w;ÙUòa ~ã;0½Z)«Õ¬ÞÆ\'ÖÜA2SG;¤SÞ©rjLðÏ¨±´dBd³\nqËlqþ á#VO©7=Ó¿Ýç=ïÂuÎð²î:- »6`Ì?-T¤Íºî\"\'KÛæÉq¢£0E 4'),(3,'Charlie','{\"alg\":\"RSA-OAEP-512\",\"e\":\"AQAB\",\"ext\":true,\"key_ops\":[\"encrypt\"],\"kty\":\"RSA\",\"n\":\"qd7YkkQGPaBO-YBV2yQ9SrWv0-iLDB69YeqArp-Mj4jvc-Yyy86P4lMjC07JdLrDRa2xMmYUrLuYb3CIU0G_-A6Y5Am1mjE52v4xbFgu6GVS94Qn02fQdIraYJyaa1ChRTWi2wYH0XJvcDhOCru51Ns-CN39sZ0-k8SxbEPZPbHJsjpm08qEt0ZpV5d-9D7aK0H3_-zeZ6M8U7spqgpp0oz0ei_ToK7u_o4hKSFj_wGVBa5Oyk2KXl8P8bABCfGpMuce33gT4K5vNONEbH1q9k7iZo5u2Rrix9wQRnx8SIZM3hAYQZcpvKktoAySprxI4wN8SVbjtcH4Ct10cKGtMQ\"}','áÕÿb¹¹<jH\"déö]Çs t/KÞ¹«åÀºgAõµº×;°&ß½:øNb÷ÔG7z','¨dB&C$|ÃÕU<ö÷m@»°<Ôw½à@\"íZ.´ 7^Ç©µÁæÇOMúôuÓoP$fÔÐÄÓÚÏi\r	6Aº8ïßn~h\n¼è÷Ð×dhçuhÝ±Ûªî­¸Ì#~KÌc.Zi1ÍT!u<¤ÓÆ+\nãUþ^ V·¾6Ï\rß»Øì;g/´ºûC27Ù-\rv}31dë?ÂèTðb;Ò(éx_û~\0µÔyJ`Ó­ô¢Ô¹¹#zÚh\"· RNg\\þr|R°ÑÒoúÔ?úµâ=:ü³8ûGK´|1µ','PÏÁ>o¶²8	.^0lqñ´Bb\'JmÂþô6ErêËé,kty ù:²4ô(3dÖì=&Sê4l(ýìí2íÀ=Dæ§Ö!º,\'CÙõ\'Ê¾(³lq;9ïàHm0²´+YÒ=äýNÜïØÀ&Àµ|2Hz§ú§u|õ(ófÃÒÄyô[ÿ\Zh¶éìZ7]=`zªç\"0@L}¬[H¹ã¸ÔySùÕM?C-m|Ú%÷/¥Ó\'ÿ3PÌ\nZ¬\\üæSêbç¬\\A(Îk¢¾Ð[=9%Æ»[C');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_storage`
--

DROP TABLE IF EXISTS `user_storage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_storage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `storage` blob,
  `salt` blob,
  `updateTime` datetime DEFAULT NULL,
  PRIMARY KEY (`id`,`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_storage`
--

LOCK TABLES `user_storage` WRITE;
/*!40000 ALTER TABLE `user_storage` DISABLE KEYS */;
INSERT INTO `user_storage` VALUES (1,1,'£ç¥#HÊ_Õó\rD¯Y,v<tÞY|Áº=¾-¬/-¤_VEi×<D\'ceÁúÃ5åyOJÏSèíì\rä\0ÐA¶*Äå+mï_Øð<q	¹\ZNÎÉð7;Xóêlóµ7éGîAÙÑgeûÑ7`ÿµcÀ´øR³÷Õ¡MÓ;¸\"n±7Ç\\æ^gÄ¬YG·WWjÛPÖ:XÜÃë¸x¾kC¨óùð»ávóX*:Ù1\"\Zl½Ã¾ÌØeÓ²ÆmèÐ¾rhÖÅhiÙä\'Äó{W·prÚýÝA­Ê¿Np)áÖµh]¡Kª9è-Á{F¯!.ÜQ¨{g	z­[¬¼	¤ßWçàRØ39Ã<E%1D{¢3Õ#ãTMôù£Pïw5käH0Z2u%äM×NMÜdYBxß\rokR¤w.UcQ®×pË5!ÀUüvé]é¶õ¨¶Â\ZÛ\nd]*½Ûõ±zãg¿M;<ºÐÑºÔ÷ +ÅÁæØ®ÕùºÐÛV7ØKi	°íÞ®û>¿¨x`Õ¯+oòRßùV÷âèâû7y¾¡F$Ê³ÂW«Aqsò×Ô²YIÇF&c×ÞN~EDW%áá¾+;¦j§f<eP×²QfBj!M]yj>ß;>@8ô×°g>|ÊvÝe[Îâ×mµº}^õÊ]([\r¢á¿ìóåvÎÆWûf5¢¥Ü<Ø%d(äV\rUOýa­±T¤O¡ë:Þ1R§NU.¦A8;çY@S¡µSÒOa^ªÿÆ®ÚÜË9-\n»OØVb<~´ 8]Î¾7Û8ô]4àæÉ®¿uìÈ¦@ü¡|DìÀ	ÿLI	Ã©ê\'ä;\Z\rY\0¸Ò\\á&Ý\Z,Ý%ROá\\åñ|â\'ô@Õt3BhåªÄêÝû\rÇ_$çyÓ íÍE°H%AÂL-`¯ÏK±¨f-äHöÔø!be®Vg¿]#nnUY&Ù6Vã³7;¯îo#Æí)8\rÄÏ\0rU\\ËEÿ>®½VJ-HÉr·Yyîf+áà\"cV; Æ¶á´ã?¹ûT#Ú]&ÿ.¨8ì3#b¨o(tcw<|rzwiÅjNh½qùþR(\'zVÂRñgiçÑò{ p%qOéïÞÓàâRT}÷^Náÿ§ÝÕíñÊ£´æ\\´¶Þ«r5°G°t/¼ÎYãT0]1Bí×mnÜQç#ÔúÌ6>nÛ§N<ã*½¸*rSM0\\.í×l%f¶à¿Cè\\¨W.;7ÙQ«Ä\'_SÞ÷ÿ$z³¼©À(kÈ«µ½­7w\'û\"zÈ¢Ñ°+çJhæ[)	T\næÅ]+³âæA|9¬i¤°=ªzÝsXô´o\"SøJC:~à0?@®\nbðR.ö8w°÷Tñmb«m°\Z³;èVáäSUjþ;#:zß&¬æÜ1Ó¶.Q4Ûõ<j\'­r#éÅÅåNNÓèLGLóã,òÑ\\jd­%ÆØÀî	Í¹K!d¬.U+² Ì+×»ÅÌçoÿtUJdkm°-ñ	ºU<ÓÍÜ8`²\\ÂMÕ)\"¾3äZïk®èúk¤öÄ\0ZÇòxaÌö2\'À¿Vh9þæß\n\rÉ6b÷Ø}B0EâúWlÕVþmLXµîáßyá/æéÛä+ð¤_#á§L³ÞwÇÖ´`Õy<¯ñ%htE¬>.¾C3(ò<P5ä³j|·÷í!ÖÈg7yQ,uo8a§ü3^§\ZåY8À$®§é¦Än1\'EPQHãvgMãâqVGnÕ,á1LùØÌ@ÜSe´dFHKÕDÃÇË3Ü{×Y[,·³ÚaØrç6]ÆþÙdÕ³¾@µP¢Qìkön\0qÀm(R?_ö\0¼»E7]bs\0ÛE=ßÁÚÑ%¤l¶	{µ½ÉËÌI+¬ý`¹>Í¢ôq½ûË)×½q!q«Û]f¾iÉfWØù\\­÷Æ&«UßB&C¯ÂÝ²¯÷i¼´p[ ¥`1¤®Ræ©T}<ÏÑª©Ì!P>þ*U¢«¤x²','ðqJ²¹ v>?ýp','2018-03-19 10:13:16'),(2,2,'®s]fûiÌ;ÅKCð%c\\SzkM&âøâ9OéìbþÒoëõÑzöÔÑ1¥A^pxyÕE½ì¢>FÕ96i6Ýäù~ÑG\r¡1\\®ò>E²Fd,êi»8÷XP2¦@8tÆÀ»ê^\rz-íáXh½æ[\'_ºoí;ºãOq§kWÿO*Úø8\Zé÷Gj¢éíýzº± ;ýÞ°ÀwÖ­\"±ØX\r=mOo*µ#£YÏ!¾aS¶åE¥&ÆYw$9ÿ#[½yðënÜ±tI}²þì÷µ+TÍÆ=_±Ü¾ñ ã©ÝN-¡6uaù÷vÿyî[èËý¤Ü#Î a¹Ï!â%(xË/rý¿Äù\r3ðæí¤ÖSè>ñ°ïÐ7;À¿Ãb\Z?qa4C¤^19]·<ûµojp£Áå¥Ï¼ñ²Þê¯yûZÞ¬ÈÍH1ïóV.éu+1ËðµØ±üôb7ÞgWQTjVÜÚG	m}A4)?1\'x`ØÊÊ&YDÈî¾­(tvÿ\rÍ\'ê(°{YÇÆjÀÃ­æÄ¬TÍÁ­ÀÓ;Ð&×¹A:ëQñ´ÛÝ<6Þí ?ÐÎþÁ=³òldN\'ùjÊöMzCÜ.mn¶Ótè|Â%C%¡ëéÏX3Ïä/nìfrºLB-Ô$¡1ö¶° êÔ$ø/k³ÈÖS$Y:¡¨î##¶(mpQ£Ä¡¶N®orµíª¯ôèZl7;þÅç¿Ê±4Lò:Q¶.Ý½55»&#úIþÖÅÝ#!u_exò6ZõïSï3ÄPËgGj`µòDp­¿ùG¿H*ÒÇ|<¾¸0!\r¼¹©ÂBhcD)5)îè!h~$Ó5Ø¡F.æì%­Á\n$Gö#\nÏ/Ú¼a7®a)cÕ2\0ÏV#ùÎ¦Ü ®Ä¸>ÅN»m»u_,í^Hx2Ö1XL5dfÓù²wN£fox-[Þ¹VèQòX¤\Zæ¢ûV¤ÀR6ÙâþÊSZù2s©æë;Öëå4=xc{``2x+ÈmgÁ6ó@øufZTCdº_ÿ_jmg\\-õ¡4¶2$ÎoL@¾ÀQFòl\rìúÎUå{²ô,ÛGî§_­P¨Hßtò÷,6X(èÃ7R¢C{¥@õÆ)¹ËÕPJh*P0X¾)Ã;ø`7ªy+²,@1·7þ»ôcÚB\'>ø¹AËÂëJKi¸>1Æ\"kç|pæñ¤Ö5®eémf¿YÍiþXì;ÙBµ¾{\\nuHÖ©éô^é¤ÓeM9$`ïÈÅÂó,Tô£ãä *e¹°4<UÔ!®¾Ùf+ÔsdóÚîM>j^ÑÔI-\"\'\"¯ë²?ÆMúJ\0EöCk£ò¡JdIî\rWóýü3xàV}à\"wÍvÓä;r4»Ôu4J¸Ñß\"þæ(½ðªÚTBÆdZ;ÇníøÐçPQJM_¬!³¥<<ÏÊå.Ýc ¤1ñX²ZQ:Ì*ë¶MsÌô»¹^.i<ËîI?È5ûAM¢J¡Q*`§ÕÛ-Áx8#ÿªA\"âmG\'ýNÖ£fwÃ7b\\?è¥H_\'k÷¢÷îT ±Ûý§%$>ÿ±Æ¯} ùAZð9ñÊê¢ö²¯zÈÉ%ôBbZË¶óÖ¨t¶uu0-Âqþ³Ü[Î-ÚJ\'WrÞþjW·)9éì%3ºw¬N³vûX6árL±Û¹*§õÔ=Í	¿NtØ!ë(H&|}àmvx2Ú%r\n©ôm`.M`pc-Ü¶éH÷oëµºÿÛûú3¥¢À&»¿áfé»iêAg]TÌ]p°&wp·±5+Ä¸q\nf+Ò<ßÊùÿÏí¬¦åCsC(ü\r]MBÏDxø|\n·Ô%YaÑÅÅ|N§ÝÛo6/5ø<6ÞqÝ\nJ¸Á-}¢9ÏøÄXjrpæJÿÀA, IÈëÈBEú<®`I3v/¨-pÔ^Jµ\'<píÀ42õNtOnü__AFµAó!','ubÇ­_®¬h\Zá9pµü','2018-03-19 10:13:24'),(3,3,'	Ïàúó7+T*2Dÿ>e¯ÿy½f±d³V®d}¿9HêjQ~­wÛµndm©>\neØ¬n¤¼U>¢ \n\nus$aåª{fãÎ,¤QÁbÅKRxUa8ÉBÂ¯ýg§røetpáÜ/Üªä6Úcñw!ÀµÎ¦sV`µäcd¢Ü@µ¥½F!¨Ác¸E]îãGô¾påÐ%¢±\Zb@ïtX#RpCIüù¢¯3Í§«O ßÜA\"ñ)¯Id3Ç×­n¬©dòòöÇ¥zF||û­dPq§_)ÈfUc&=ë/nbï/HhÔZÜ\n\rþßQJõ_\\ê,R\nú.ªÂ¯hyf1×øB\Zi)Qêæ6Ú°qÕÆmqx/_3N¥n¿ª¶´Q¿ö@âAÌm´$àsÁ/§7ôCL\ròÓB@ïì-ûÚdy¤¢Ãº=ã1áïÞ^aäKG)Aµ-}piTó3Rr Èwgßÿg:[oá}HB@ÞÜÀ #3V¿´ºbÒb­·^ßÌÜ¬¶`}nNsÌ6Q>±Þdîh»í²å°Å!g«¤[zjW¹ZÂrä¨gcfT±H­uÙq0\\\Z8H¡ªZ]Sb¯¤ä;_Qì[ûÏýÃÍ;öU±¾Ë­ñç_Ï¯Ø´\röU#IXãæäGÛ\'ÚãäU);GU)k`?mý@d«èkiÐÙm-ÃHÔÀøéláÍ\\0\Z2Òßgá|@ûÞÞÏáåØT7ÖQ=GÄ ×*F(Ã!1àüHpQÈúö´¸{ÒWb¸~MaÖý²Y½`6éMl[.=­âÐgë_Ù¯ãÅ v\'­½¬«Z¥A×ÄÎÃK3½ªÂYk®Íæ?JäÛØÙûN;Ït&·ªÄÉ1òì3vè<e`ÌòöÛ8Ðß±ZûíxÞ\ZLJï0wFØID*ñÇÎ9ùé  ÕóÃo küR?øø[÷vÌè$Jìeã_Q·0­m^ººuêµÝeÄ<µü\ZüJo±Ý\'ÜÒK¢¥èÏòH<S^âi¯ ­ßErlß\nw#kÅÍþ#­è\0;ÆIw>Ã>âØÛ	±KNåe@eW«ÍMnàÏ	ÜýÙv3³Ah ÷Â¬S³ã4¶Þ±RS²¿iu\0­ok©ys:ÚdªG&þÁl¥\nW;þñÉo9ZË7;^ÇÑÓRBhçM®«²CoRâ^§NâÙð2Ë§îä[ ún hmsÈ½^Â\"s/Êu&Ñòäü$a(|ý½w[ÍYÄlAÖTÚw\'v¼\\hd6çèå8!x©+i+}îuIH®Ú	)<¦5@$RÌî7jÞ»­ó\rVARß4(æà¹9èéA´%Lpíht\"?#ÿlDU=<ü\ZüÊ¢WÎ	(ÝFq[D¨@Å\Z6Ú\0t®^{÷éÞÎC¡º×ÆéíGÑwV¢S~EaC«òz¾0hú¡©X2i`	$={dîrÇ\"_T60ù\Zº<ÑÜrFZoÄÝ9A:É`ì¼Ç6àÈ6ah§WÑ	_\'	õ¼ø÷OÏn1Ô\0W­7o\Z}\Zëï\ZÝ\ZjCQ>Hëlú4ÔðÕñ¼+IÙQçx¿6ÃÖ¬9è`0\"èÝþ,ø!Ód­£RèÓ2¶	-{UKÎiÓqæiö*QL}ÁÐ]üÚ[Áoôqá\rÑÚV°OmnÁ4{sw\Zj.Ê Ú\nÖWó·æG!\nuú 2·XøÆKX0üRIºÖÛeØ*Í¿×4ì\0Ù³i¨^0Ç»+ªæ!Èÿ¡ã?â\"=$Å|ê¢ÈÉ(§é0ÃÅ¶BõùÅH}^òïïþ¶üÐY\Z2î,ä¢®«È6C§Ny-\ZäèaÙPIxýk³ªëá>9\ng«{À_êÀÑÇÏÓG#ÈØÎ\0!ûS;ç³ wá#3F>À0wÊP4AùC^_\nêÚ\ZÇG&==¼ØÅ¯¹}Xð°E&ëÒc7Ï*IwÆ$ö©61ÅfÛ*õ|j¶¬£3õuyÅg\0}õuú\nÔX(¸nQ<Ä;×Ê(Úø9÷°y·','gm°ú¨j´´3uà','2018-03-19 10:13:35');
/*!40000 ALTER TABLE `user_storage` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-03-19 10:20:16

ffmpeg -ss 00:00:00 -i test1.webm -t 00:01:00 -vcodec copy -acodec copy 1.webm
ffmpeg -ss 00:01:00 -i test1.webm -t 00:01:00 -vcodec copy -acodec copy 2.webm
ffmpeg -ss 00:02:00 -i test1.webm -t 00:01:00 -vcodec copy -acodec copy 3.webm
ffmpeg -ss 00:03:00 -i test1.webm -t 00:01:00 -vcodec copy -acodec copy 4.webm
ffmpeg -ss 00:04:00 -i test1.webm -t 00:01:00 -vcodec copy -acodec copy 5.webm
ffmpeg -ss 00:05:00 -i test1.webm -t 00:01:00 -vcodec copy -acodec copy 6.webm
ffmpeg -ss 00:06:00 -i test1.webm -t 00:01:00 -vcodec copy -acodec copy 7.webm
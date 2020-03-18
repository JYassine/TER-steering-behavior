var AudioGame = {

    addAllSongs : (audioManager) =>{
        audioManager.addSong("boatSong","audio/boat_song.ogg",true,false,0.5)
        audioManager.addSong("checkPointSong","audio/success_checkpoint.wav",true,false,0.6)
        audioManager.addSong("windSong","audio/wind.ogg",true,true,2)
        audioManager.addSong("backgroundSong","audio/music_bg.mp3",true,true,3)
        audioManager.addSong("clickSong","audio/button_click.wav",false,false,2)
        audioManager.addSong("crashSong","audio/crash.mp3",false,false,4)
        audioManager.addSong("clockSong","audio/tick_tock.ogg",false,false,3)
        audioManager.addSong("winnerSong","audio/win.mp3",false,false,3)
        audioManager.addSong("loserSong","audio/fail_sound.mp3",false,false,3)
        audioManager.addSong("missileSong","audio/missile.wav",false,false,2)
        audioManager.addSong("explosionMissileSong","audio/explosion_missile.ogg",false,false,3)
        
        audioManager.addSong("ughSong","audio/ugh.mp3",false,false,5)
        audioManager.addSong("ennemySpottedSong","audio/ennemy_spotted.ogg",false,false,2)
        
    }

}


export default AudioGame;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PlayerPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 grid grid-cols-3 gap-8">
      {/* TTS Queue */}
      <div className="col-span-1 space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          🗣️ TTS Queue
          <span className="text-sm font-normal bg-white/10 px-2 py-1 rounded">3 pending</span>
        </h2>
        <div className="space-y-2">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <p className="text-lg font-medium">"Team 1 is asking for help with the database!"</p>
              <p className="text-sm text-white/50 mt-2">From Team 1 • 10s ago</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10 opacity-50">
            <CardContent className="p-4">
              <p className="text-lg font-medium">"Pizza has arrived!"</p>
              <p className="text-sm text-white/50 mt-2">From Admin • 1m ago</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Music Player */}
      <div className="col-span-2 space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          🎵 Now Playing
        </h2>
        
        <Card className="bg-white/5 border-white/10 overflow-hidden">
          <div className="aspect-video bg-black flex items-center justify-center relative group">
            <span className="text-6xl">📺</span>
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="ghost" className="text-white h-16 w-16 rounded-full border-2 border-white">
                ▶️
              </Button>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold">Lo-Fi Hip Hop Radio</h3>
                <p className="text-white/60">Requested by Team 4</p>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" size="icon">⏮️</Button>
                <Button variant="outline" size="icon">⏸️</Button>
                <Button variant="outline" size="icon">⏭️</Button>
              </div>
            </div>
            <div className="mt-6">
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-primary"></div>
              </div>
              <div className="flex justify-between text-xs text-white/40 mt-2">
                <span>1:23</span>
                <span>4:05</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-xl font-bold">Up Next</h3>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded bg-white/5 hover:bg-white/10 transition-colors">
                <div className="h-10 w-10 bg-white/10 rounded flex items-center justify-center">🎵</div>
                <div className="flex-1">
                  <p className="font-medium">Awesome Hackathon Track {i}</p>
                  <p className="text-xs text-white/50">Requested by Team {i + 1}</p>
                </div>
                <span className="text-sm text-white/50">3:45</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

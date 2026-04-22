import { db } from '../src/lib/db';
import { hashPassword } from '../src/lib/auth';

async function seed() {
  console.log('🌱 Seeding PrimeX database...\n');

  // Create demo users
  const users = [];
  const usernames = [
    { username: 'alexcreator', email: 'alex@primex.com', bio: '🎬 Filmmaker & Content Creator | 4K Enthusiast', isCreator: true },
    { username: 'sarahmusic', email: 'sarah@primex.com', bio: '🎵 Music producer & DJ | Beats & Vibes', isCreator: true },
    { username: 'mikegaming', email: 'mike@primex.com', bio: '🎮 Pro Gamer | Streaming daily', isCreator: true },
    { username: 'emmavlog', email: 'emma@primex.com', bio: '📹 Travel vlogger | Exploring the world', isCreator: true },
    { username: 'davidtech', email: 'david@primex.com', bio: '💻 Tech reviewer | Latest gadgets & tutorials', isCreator: true },
    { username: 'lisaart', email: 'lisa@primex.com', bio: '🎨 Digital artist | Creative process videos', isCreator: true },
    { username: 'jamesfitness', email: 'james@primex.com', bio: '💪 Fitness coach | Workout routines', isCreator: true },
    { username: 'oliviacook', email: 'olivia@primex.com', bio: '🍳 Chef & Food blogger | Recipes daily', isCreator: true },
  ];

  const hashedPassword = await hashPassword('demo123');

  for (const u of usernames) {
    const user = await db.user.create({
      data: {
        username: u.username,
        email: u.email,
        password: hashedPassword,
        bio: u.bio,
        isCreator: u.isCreator,
      },
    });
    users.push(user);
    console.log(`✅ Created user: ${u.username}`);
  }

  // Create demo videos
  const videoData = [
    { title: 'Cinematic Mountain Sunrise - 4K Drone Footage', description: 'Breathtaking sunrise over the Swiss Alps captured in stunning 4K resolution. Watch as golden light paints the peaks and valleys in this cinematic drone film.', tags: 'cinematic,nature,4k,drone,mountain' },
    { title: 'How I Edit My YouTube Videos - Complete Guide', description: 'Step-by-step tutorial on my video editing workflow. From raw footage to polished content using DaVinci Resolve and Premiere Pro.', tags: 'tutorial,editing,youtube,video' },
    { title: 'Best Budget Camera Gear 2025', description: 'Looking for the best camera gear without breaking the bank? Here are my top picks for budget-friendly filmmaking equipment.', tags: 'tech,camera,budget,gear,review' },
    { title: 'Live Concert Highlights - Summer Music Fest', description: 'Amazing performances from this summer\'s biggest music festival. Featuring incredible light shows and crowd energy.', tags: 'music,concert,live,festival' },
    { title: '24 Hours in Tokyo - Travel Vlog', description: 'Exploring the vibrant streets of Tokyo in just 24 hours. From sushi bars to neon-lit alleys, this city never sleeps.', tags: 'travel,tokyo,japan,vlog' },
    { title: 'Advanced Gaming Setup Tour 2025', description: 'Check out my ultimate gaming setup with triple monitors, custom RGB, and the latest peripherals. Full specs inside!', tags: 'gaming,setup,tour,tech' },
    { title: 'Cooking the Perfect Steak - Chef\'s Method', description: 'Learn the professional chef\'s technique for cooking the perfect medium-rare steak every time. Simple but effective.', tags: 'cooking,steak,chef,food,tutorial' },
    { title: 'Digital Art Speed Paint - Fantasy Landscape', description: 'Watch me create a fantasy landscape from scratch in Photoshop. 3 hours compressed into 10 minutes of pure creativity.', tags: 'art,digital,painting,fantasy,creative' },
    { title: 'Full Body Workout - No Equipment Needed', description: 'Get fit anywhere with this 30-minute full body workout. No gym, no equipment, just you and determination.', tags: 'fitness,workout,health,exercise' },
    { title: 'Building a PC from Scratch - Beginner Guide', description: 'Complete PC build guide for beginners. I walk you through every step from parts selection to first boot.', tags: 'tech,pc,build,tutorial,beginner' },
    { title: 'Street Food Tour - Bangkok Night Market', description: 'Exploring the incredible street food scene at Bangkok\'s famous night markets. Pad Thai, Mango Sticky Rice, and more!', tags: 'food,travel,bangkok,streetfood' },
    { title: 'Lo-Fi Beats to Study and Relax', description: 'Chill lo-fi hip hop beats perfect for studying, working, or relaxing. 2 hours of continuous smooth vibes.', tags: 'music,lofi,study,chill,beats' },
  ];

  for (let i = 0; i < videoData.length; i++) {
    const user = users[i % users.length];
    const video = await db.video.create({
      data: {
        userId: user.id,
        title: videoData[i].title,
        description: videoData[i].description,
        videoUrl: `/download/long-videos/demo-${i + 1}.mp4`,
        tags: videoData[i].tags,
        views: Math.floor(Math.random() * 50000) + 1000,
        likes: Math.floor(Math.random() * 5000) + 100,
        duration: Math.floor(Math.random() * 1800) + 120,
      },
    });
    console.log(`🎬 Created video: ${videoData[i].title.substring(0, 40)}...`);
  }

  // Create demo reels
  const reelData = [
    { caption: 'Wait for it... 😱 #viral #mindblown' },
    { caption: 'POV: You finally nail that recipe 🎉 #cooking #win' },
    { caption: 'This sunset though 🌅 #nature #beautiful #sunset' },
    { caption: 'Gaming clutch moment! 🎮🔥 #gaming #clutch' },
    { caption: 'Street art process 🎨 #art #streetart #process' },
    { caption: 'Morning workout vibes 💪 #fitness #motivation' },
    { caption: 'New tech unboxing! 📱✨ #tech #unboxing' },
    { caption: 'Cat being cat 🐱 #funny #cat #pets' },
    { caption: 'Travel hack you NEED to know ✈️ #travel #tips' },
    { caption: 'Drawing in 15 seconds ✏️ #art #speeddraw' },
  ];

  for (let i = 0; i < reelData.length; i++) {
    const user = users[i % users.length];
    await db.reel.create({
      data: {
        userId: user.id,
        videoUrl: `/download/reels/reel-${i + 1}.mp4`,
        caption: reelData[i].caption,
        likes: Math.floor(Math.random() * 10000) + 500,
        shares: Math.floor(Math.random() * 2000) + 50,
      },
    });
    console.log(`🎞️ Created reel: ${reelData[i].caption.substring(0, 30)}...`);
  }

  // Create friend connections
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < Math.min(i + 3, users.length); j++) {
      await db.friend.create({
        data: {
          senderId: users[i].id,
          receiverId: users[j].id,
          status: 'accepted',
        },
      });
    }
  }
  console.log('👥 Created friend connections');

  // Create notifications for primexuser (if exists)
  const primexuser = await db.user.findUnique({ where: { username: 'primexuser' } });
  if (primexuser) {
    // Make friends with some demo users
    for (let i = 0; i < Math.min(3, users.length); i++) {
      await db.friend.create({
        data: {
          senderId: primexuser.id,
          receiverId: users[i].id,
          status: i < 2 ? 'accepted' : 'pending',
        },
      });
    }

    // Create notifications
    const notifTypes = [
      { type: 'friend_request', title: 'Friend Request', message: `${users[3].username} sent you a friend request` },
      { type: 'like', title: 'New Like', message: `${users[0].username} liked your video` },
      { type: 'friend_accept', title: 'Friend Accepted', message: `${users[1].username} accepted your friend request` },
      { type: 'like', title: 'New Like', message: `${users[2].username} liked your reel` },
      { type: 'friend_request', title: 'Friend Request', message: `${users[5].username} sent you a friend request` },
    ];

    for (const notif of notifTypes) {
      await db.notification.create({
        data: {
          userId: primexuser.id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          read: notif.type === 'friend_accept',
          fromUserId: users[0].id,
        },
      });
    }
    console.log('🔔 Created notifications for primexuser');
  }

  // Make admin user friends with demo users
  const adminUser = await db.user.findUnique({ where: { username: 'admin' } });
  if (adminUser) {
    for (let i = 0; i < Math.min(4, users.length); i++) {
      await db.friend.create({
        data: {
          senderId: adminUser.id,
          receiverId: users[i].id,
          status: 'accepted',
        },
      });
    }
    console.log('👥 Connected admin with demo users');
  }

  // Create sample messages between friends
  if (primexuser) {
    const messages = [
      { senderId: users[0].id, receiverId: primexuser.id, message: 'Hey! Love your content 🔥' },
      { senderId: primexuser.id, receiverId: users[0].id, message: 'Thanks! Your 4K footage is amazing too!' },
      { senderId: users[0].id, receiverId: primexuser.id, message: 'Want to collab on a video sometime?' },
      { senderId: users[1].id, receiverId: primexuser.id, message: 'Check out my new track! 🎵' },
      { senderId: primexuser.id, receiverId: users[1].id, message: 'Just listened to it - absolutely fire! 🔥' },
    ];

    for (const msg of messages) {
      await db.message.create({
        data: {
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          message: msg.message,
          seen: true,
        },
      });
    }
    console.log('💬 Created sample messages');
  }

  console.log('\n✅ Seed complete! Created:');
  console.log(`   ${users.length} users`);
  console.log(`   ${videoData.length} videos`);
  console.log(`   ${reelData.length} reels`);
  console.log(`   Friend connections + notifications + messages`);
}

seed()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

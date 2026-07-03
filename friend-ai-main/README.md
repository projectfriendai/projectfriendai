# 🌟 Mental Wellness AI Companion

A compassionate, empathetic AI friend built with Python and Claude API that provides supportive conversations focused on mental health and wellbeing.

## Features

✨ **Core Features:**
- **Empathetic Conversations**: Supportive AI that listens without judgment
- **Conversation History**: Remembers previous chats for continuity
- **Mood Tracking**: Log and track your emotional patterns over time
- **Personalized**: Learns your name and builds familiarity
- **Safe & Responsible**: Recognizes limitations and encourages professional help when needed

🎯 **What It Does:**
- Listens actively and validates your feelings
- Asks thoughtful follow-up questions
- Suggests healthy coping strategies
- Celebrates your wins, no matter how small
- Maintains conversation context across sessions
- Provides mood logging and analysis

## Prerequisites

- Python 3.8 or higher
- An Anthropic API key (get one at https://console.anthropic.com)

## Installation

### 1. Clone or download this project

```bash
mkdir wellness-companion
cd wellness-companion
```

### 2. Create a virtual environment (recommended)

```bash
# On macOS/Linux
python3 -m venv venv
source venv/bin/activate

# On Windows
python -m venv venv
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Set up your API key

Create a `.env` file in the project directory:

```bash
echo "ANTHROPIC_API_KEY=your_api_key_here" > .env
```

Or export it directly:

```bash
# On macOS/Linux
export ANTHROPIC_API_KEY="your_api_key_here"

# On Windows (PowerShell)
$env:ANTHROPIC_API_KEY="your_api_key_here"
```

**Get your API key:**
1. Go to https://console.anthropic.com/account/keys
2. Create a new API key
3. Keep it secure and never commit it to version control

## Usage

### Start the companion

```bash
python wellness_companion.py
```

### Commands

During a conversation, you can use these commands:

- **`mood`** - Log your current mood and intensity (1-10 scale)
- **`quit`** - Exit the conversation (saves automatically)
- **`clear`** - Clear conversation history and start fresh
- **Regular chat** - Just type naturally to talk with your companion

### Example Session

```
============================================================
🌟 Welcome to Your Wellness Companion 🌟
============================================================

What's your name? Alex

Nice to meet you, Alex!

I'm here to listen and support you. Feel free to share whatever's on your mind.
Type 'mood' to log your mood, 'quit' to exit, or 'clear' to start fresh.

How are you feeling right now? (one word or short phrase): anxious

📝 Logged: anxious

Alex: I've been feeling really overwhelmed with work lately. There's too much on my plate.

Companion: That sounds really tough, Alex. Feeling overwhelmed is a valid response when there's too much 
coming at you. Can you tell me a bit more about what's making you feel this way? Is it the amount of 
work itself, the types of tasks, or maybe the deadline pressure?

Alex: mood
How are you feeling? anxious
On a scale of 1-10, how intense is this mood? (default 5): 7
✓ Mood logged!
```

## Data Storage

The companion automatically stores:

- **Conversations**: `companion_data/conversations.json`
  - Your messages and the AI's responses
  - Your name preference
  - Last update timestamp

- **Mood Log**: `companion_data/mood_log.json`
  - Timestamped mood entries
  - Mood intensity ratings (1-10)
  - Useful for spotting patterns

**Privacy**: All data is stored locally on your machine. Nothing is sent to external servers except API calls to Claude.

## Important Notes

⚠️ **This is not a substitute for professional mental health care.** The companion is designed to:
- Provide supportive conversation
- Help you reflect on your feelings
- Suggest healthy coping strategies
- **NOT** diagnose or treat mental health conditions

If you're experiencing:
- Suicidal thoughts
- Severe depression or anxiety
- Self-harm urges
- Mental health crises

**Please reach out to professional resources:**
- **National Suicide Prevention Lifeline (US)**: 988 or 1-800-273-8255
- **Crisis Text Line**: Text HOME to 741741
- **International Association for Suicide Prevention**: https://www.iasp.info/resources/Crisis_Centres/

## Architecture

```
wellness_companion.py       # Main application
├── WellnessCompanion       # Core class handling conversations
│   ├── chat()              # Send messages to Claude
│   ├── load_conversation_history()  # Restore past chats
│   ├── save_conversation_history()  # Persist conversations
│   ├── log_mood()          # Track emotional patterns
│   └── start_session()     # Interactive conversation loop
├── SYSTEM_PROMPT           # Mental wellness AI instructions
└── Model: claude-opus-4-20250805

companion_data/            # Persistent storage
├── conversations.json      # Chat history & context
└── mood_log.json          # Emotional tracking data
```

## Customization

### Change the AI's Personality

Edit the `SYSTEM_PROMPT` variable in `wellness_companion.py`:

```python
SYSTEM_PROMPT = """You are a compassionate, empathetic mental wellness companion. Your role is to:
# ... modify these instructions to suit your needs
"""
```

### Use a Different Claude Model

Update the `MODEL` variable:

```python
MODEL = "claude-sonnet-4-20250514"  # Or another available model
```

See available models: https://docs.claude.com/en/docs/about/models/overview

### Change Data Directory

Modify the `DATA_DIR` path:

```python
DATA_DIR = Path("my_custom_data_folder")
```

## Troubleshooting

### "ModuleNotFoundError: No module named 'anthropic'"

```bash
pip install -r requirements.txt
```

### "401 Authentication Error" or "API key not found"

- Check your `.env` file exists and contains your API key
- Verify the key is correct: https://console.anthropic.com/account/keys
- Try exporting directly: `export ANTHROPIC_API_KEY="your_key"`

### Conversations not saving

- Check you have write permissions in the project directory
- Ensure `companion_data/` folder exists
- Check disk space on your machine

### API rate limits

- The free tier has usage limits
- Consider upgrading your account: https://console.anthropic.com/account/billing/overview

## API Information

This project uses the **Anthropic Claude API**:

- **Documentation**: https://docs.claude.com/en/api/overview
- **Pricing**: https://www.anthropic.com/pricing
- **Models**: Updated regularly - check available models at https://docs.claude.com/en/docs/about/models/overview

## Contributing

Feel free to:
- Add new features (journaling, meditation reminders, etc.)
- Improve the system prompt
- Add sentiment analysis
- Create a web interface
- Integrate with other wellness tools

## License

This project is provided as-is for personal use. 

## Support

For questions about:
- **Claude API**: Visit https://docs.claude.com
- **This code**: Check the comments in wellness_companion.py
- **Mental health**: Reach out to professional resources

---

**Remember: You matter. Take care of yourself. 💙**

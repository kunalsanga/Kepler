import websocket
import uuid
import json
import urllib.request
import urllib.parse

COMFY_SERVER = "127.0.0.1:8188"
CLIENT_ID = str(uuid.uuid4())

def queue_prompt(prompt_workflow):
    """
    Submits a workflow to the ComfyUI queue.
    """
    p = {"prompt": prompt_workflow, "client_id": CLIENT_ID}
    data = json.dumps(p).encode('utf-8')
    req = urllib.request.Request(f"http://{COMFY_SERVER}/prompt", data=data)
    return json.loads(urllib.request.urlopen(req).read())

def get_image(filename, subfolder, folder_type):
    """
    Retrieves an image or video file from ComfyUI.
    """
    data = {"filename": filename, "subfolder": subfolder, "type": folder_type}
    url_values = urllib.parse.urlencode(data)
    with urllib.request.urlopen(f"http://{COMFY_SERVER}/view?{url_values}") as response:
        return response.read()

def get_history(prompt_id):
    """
    Gets execution history (contains output filenames).
    """
    with urllib.request.urlopen(f"http://{COMFY_SERVER}/history/{prompt_id}") as response:
        return json.loads(response.read())

def get_images(ws, prompt_workflow):
    """
    Connects to WebSocket, executes workflow, and returns generated file data (bytes).
    This function blocks until execution is finished.
    """
    prompt_id = queue_prompt(prompt_workflow)['prompt_id']
    
    while True:
        out = ws.recv()
        if isinstance(out, str):
            message = json.loads(out)
            if message['type'] == 'executing':
                data = message['data']
                if data['node'] is None and data['prompt_id'] == prompt_id:
                    break # Execution is done
        else:
            continue # Binary data (previews)

    history = get_history(prompt_id)[prompt_id]
    
    generated_data = []

    for node_id in history['outputs']:
        node_output = history['outputs'][node_id]
        # Handle images
        if 'images' in node_output:
            for image in node_output['images']:
                image_data = get_image(image['filename'], image['subfolder'], image['type'])
                generated_data.append(image_data)
        # Handle videos/gifs (VideoHelperSuite or AnimatedDiff often use 'gifs' or 'videos' key)
        if 'gifs' in node_output:
             for video in node_output['gifs']:
                video_data = get_image(video['filename'], video['subfolder'], video['type'])
                generated_data.append(video_data)
        if 'videos' in node_output:
             for video in node_output['videos']:
                video_data = get_image(video['filename'], video['subfolder'], video['type'])
                generated_data.append(video_data)

    return generated_data

def open_websocket_connection():
    ws = websocket.WebSocket()
    ws.connect(f"ws://{COMFY_SERVER}/ws?clientId={CLIENT_ID}")
    return ws

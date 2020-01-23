import time
import os


def __lldb_init_module(debugger, d):
    if os.path.exists("/tmp/lldbmarker"):
        os.remove("/tmp/lldbmarker")

    while True:
        if os.path.exists("/tmp/lldbmarker"):
            break
        time.sleep(1)

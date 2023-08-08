import subprocess


class Client:
  def __init__(self):
    self.name = 'commands_client'
    self.commands = []

  @staticmethod
  def exec(script: str):
    result = {
        "out": "",
        "err": "",
        "return_code": 0,
    }
    process = subprocess.Popen(script, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    output, error = process.communicate()
    result["out"] = output.decode('utf-8').strip()
    result["err"] = error.decode('utf-8').strip()
    result["return_code"] = process.returncode
    return result

  def add_command(self, command):
    self.commands.append(command)
    return self

  def get_commands(self):
    self.commands.map(lambda command: print(command))
    return self

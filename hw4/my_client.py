import grpc
import my_service_pb2
import my_service_pb2_grpc

def run():
    channel = grpc.insecure_channel('localhost:50051')
    stub = my_service_pb2_grpc.MyServiceStub(channel)

    nested_message = my_service_pb2.NestedMessage(inner_message="Nested Hello")
    request = my_service_pb2.MyRequest(
        message="Hello gRPC",
        numbers=[1, 2, 3],
        key_value_pairs={"one": 1, "two": 2},
        nested_message=nested_message
    )

    response = stub.SendMessage(request)
    print("Received from server:", response.message)
    print("Nested message from server:", response.nested_message.inner_message)

if __name__ == '__main__':
    run()
